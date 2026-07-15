import { app, BrowserWindow, ipcMain, shell, Menu, Notification, Tray, nativeImage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { scanAllCaches, scanAllCachesWithProgress, deleteCacheFiles } from './scanner';
import log from './logger';
import { initUpdater, checkForUpdates, downloadUpdate, quitAndInstall, getUpdateStatus } from './updater';
import { activateLicense, getLicenseStatus, deactivateLicense, validateAndRefreshLicense } from './license';
import { getScanCountForTier, incrementScanCount, canScan } from './scanCounter';

process.on('uncaughtException', (err) => {
  log.error('Uncaught exception in main process', err);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection in main process', reason);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

app.name = 'CachePilot';

if (process.platform === 'win32') {
  app.setAppUserModelId('com.cachepilot.app');
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let autoScanTimer: ReturnType<typeof setInterval> | null = null;
let isQuitting = false;

function showMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (!mainWindow.isVisible()) mainWindow.show();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
  mainWindow.moveTop();
}

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

interface AppSettings {
  autoStart: boolean;
  autoScanOnStartup: boolean;
  autoScanInterval: number;
  showNotifications: boolean;
  notificationThresholdMB: number;
  showSafetyWarnings: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoStart: false,
  autoScanOnStartup: true,
  autoScanInterval: 0,
  showNotifications: true,
  notificationThresholdMB: 100,
  showSafetyWarnings: true,
};

function loadSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = fs.readFileSync(SETTINGS_PATH, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch {}
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: AppSettings) {
  try {
    const dir = path.dirname(SETTINGS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch {}
}

function applyAutoStart(enabled: boolean) {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    path: process.execPath,
    args: enabled ? ['--auto-start'] : [],
  });
}

function startAutoScanTimer(intervalMs: number) {
  stopAutoScanTimer();
  if (intervalMs > 0) {
    autoScanTimer = setInterval(() => {
      performBackgroundScan();
    }, intervalMs);
  }
}

function stopAutoScanTimer() {
  if (autoScanTimer) {
    clearInterval(autoScanTimer);
    autoScanTimer = null;
  }
}

function getNotificationIcon() {
  const paths = [
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../dist/icon.ico'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

function performBackgroundScan() {
  if (!mainWindow) return;
  const settings = loadSettings();
  log.info('Background scan started');
  try {
    const results = scanAllCaches();
    const totalSize = results.reduce((sum, r) => sum + r.totalSize, 0);
    const totalItems = results.reduce((sum, r) => sum + r.itemCount, 0);
    log.info(`Background scan complete: ${(totalSize / 1024 / 1024).toFixed(1)} MB across ${totalItems} items`);
    const thresholdBytes = settings.notificationThresholdMB * 1024 * 1024;

    if (settings.showNotifications && totalSize >= thresholdBytes) {
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(0);
      const icon = getNotificationIcon();
      const n = new Notification({
        title: 'CachePilot',
        body: `Found ${totalItems} cache files (${sizeMB} MB). Click to review and clean.`,
        icon,
        silent: false,
      });
      n.on('click', () => {
        showMainWindow();
        mainWindow?.webContents.send('trigger-scan');
      });
      n.show();
    }

    mainWindow.webContents.send('background-scan-complete', {
      totalSize,
      totalItems,
      categories: results.map((r) => ({
        categoryId: r.categoryId,
        itemCount: r.itemCount,
        totalSize: r.totalSize,
      })),
    });
  } catch (err) {
    log.error('Background scan failed', err);
  }
}

function isAdmin(): boolean {
  try {
    execSync('net session', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function requestElevation() {
  const exePath = process.execPath;
  try {
    execSync(`powershell -Command "Start-Process '${exePath}' -Verb RunAs"`, { stdio: 'pipe' });
    app.quit();
  } catch {}
}

function getTrayIcon() {
  const paths = [
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(__dirname, '../../build/icon.ico'),
    path.join(__dirname, '../../dist/icon.ico'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return nativeImage.createFromPath(p);
  }
  return nativeImage.createEmpty();
}

function createTray() {
  tray = new Tray(getTrayIcon());
  tray.setToolTip('CachePilot');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show CachePilot',
      click: () => showMainWindow(),
    },
    { type: 'separator' },
    {
      label: 'Scan Now',
      click: () => {
        showMainWindow();
        mainWindow?.webContents.send('trigger-scan');
      },
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => showMainWindow());
}

function createWindow(startMinimized: boolean) {
  const boundsPath = path.join(app.getPath('userData'), 'window-bounds.json');
  let windowBounds: Electron.Rectangle | undefined;
  try {
    if (fs.existsSync(boundsPath)) {
      windowBounds = JSON.parse(fs.readFileSync(boundsPath, 'utf-8'));
    }
  } catch {}

  let boundsSaveTimer: ReturnType<typeof setTimeout> | null = null;
  function saveBoundsDebounced() {
    if (boundsSaveTimer) clearTimeout(boundsSaveTimer);
    boundsSaveTimer = setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        try {
          fs.writeFileSync(boundsPath, JSON.stringify(mainWindow.getBounds()));
        } catch {}
      }
    }, 500);
  }

  Menu.setApplicationMenu(null);
  mainWindow = new BrowserWindow({
    width: windowBounds?.width ?? 1200,
    height: windowBounds?.height ?? 800,
    x: windowBounds?.x,
    y: windowBounds?.y,
    minWidth: 900,
    minHeight: 600,
    title: 'CachePilot',
    backgroundColor: '#0F1115',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    if (!startMinimized) {
      mainWindow?.show();
    }
  });

  mainWindow.on('resize', saveBoundsDebounced);

  mainWindow.on('move', saveBoundsDebounced);

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  initUpdater(mainWindow);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => showMainWindow());

  app.whenReady().then(async () => {
    log.info('CachePilot starting', { version: app.getVersion(), platform: process.platform, arch: process.arch });
    const settings = loadSettings();
    applyAutoStart(settings.autoStart);
    createTray();

    // Validate license on startup
    const licenseStatus = await validateAndRefreshLicense();
    log.info('License status', { tier: licenseStatus.tier, isValid: licenseStatus.isValid });

    const isAutoStart = process.argv.includes('--auto-start');
    const startMinimized = isAutoStart;

    createWindow(startMinimized);
    initAutoScan(settings);
    log.info('CachePilot ready');

    // Send license status to renderer after window is ready
    mainWindow?.once('ready-to-show', () => {
      sendLicenseStatus();
    });

    if (isAutoStart) {
      const tryNotify = (attempts: number) => {
        if (attempts <= 0) return;
        if (!Notification.isSupported()) {
          setTimeout(() => tryNotify(attempts - 1), 5000);
          return;
        }
        try {
          const n = new Notification({
            title: 'CachePilot',
            body: 'Running in the background. Double-click the tray icon to open.',
            icon: getNotificationIcon(),
          });
          n.on('click', () => showMainWindow());
          n.show();
        } catch {
          setTimeout(() => tryNotify(attempts - 1), 5000);
        }
      };
      setTimeout(() => tryNotify(3), 15000);
    }

    app.on('activate', () => {
      if (mainWindow) {
        showMainWindow();
      } else {
        createWindow(false);
      }
    });
  });

  app.on('before-quit', () => {
    log.info('CachePilot shutting down');
    isQuitting = true;
    stopAutoScanTimer();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      if (!isQuitting) {
        // keep running in tray
      } else {
        app.quit();
      }
    }
  });
}

function initAutoScan(settings: AppSettings) {
  if (settings.autoScanOnStartup && settings.autoScanInterval > 0) {
    startAutoScanTimer(settings.autoScanInterval);
  }
}

ipcMain.handle('get-db-path', () => {
  return path.join(app.getPath('userData'), 'cachepilot.db');
});

ipcMain.handle('open-external', async (_event, url: string) => {
  await shell.openExternal(url);
});

ipcMain.handle('scan-caches', async (event) => {
  const webContents = event.sender;
  return await scanAllCachesWithProgress((categoryId, categoryName, status, itemCount, totalSize) => {
    if (webContents && !webContents.isDestroyed()) {
      webContents.send('scan-progress', { categoryId, categoryName, status, itemCount, totalSize });
    }
  });
});

ipcMain.handle('delete-cache-files', (_event, files: { path: string; size: number; lastModified: string }[]) => {
  return deleteCacheFiles(files);
});

ipcMain.handle('is-admin', () => {
  return isAdmin();
});

ipcMain.handle('request-elevation', () => {
  requestElevation();
});

ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (_event, settings: Partial<AppSettings>) => {
  const current = loadSettings();
  const updated = { ...current, ...settings };
  saveSettings(updated);

  if ('autoStart' in settings) {
    applyAutoStart(!!settings.autoStart);
  }

  if ('autoScanInterval' in settings || 'autoScanOnStartup' in settings) {
    if (updated.autoScanOnStartup && updated.autoScanInterval > 0) {
      startAutoScanTimer(updated.autoScanInterval);
    } else {
      stopAutoScanTimer();
    }
  }

  return updated;
});

ipcMain.handle('trigger-auto-scan', () => {
  performBackgroundScan();
});

ipcMain.handle('minimize-to-tray', () => {
  mainWindow?.hide();
});

ipcMain.handle('check-for-updates', () => {
  checkForUpdates();
});

ipcMain.handle('download-update', () => {
  downloadUpdate();
});

ipcMain.handle('quit-and-install', () => {
  quitAndInstall();
});

ipcMain.handle('get-update-status', () => {
  try {
    const status = getUpdateStatus();
    return {
      status: status.isChecking ? 'checking' : status.updateAvailable ? 'available' : 'idle',
    };
  } catch (err) {
    log.error('get-update-status failed', err);
    return { status: 'idle' };
  }
});

ipcMain.handle('get-app-info', () => {
  try {
    return {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      arch: process.arch,
      electronVersion: process.versions.electron,
      chromeVersion: process.versions.chrome,
      nodeVersion: process.versions.node,
    };
  } catch (err) {
    log.error('get-app-info failed', err);
    return { version: '1.0.0', name: 'CachePilot', platform: process.platform, arch: process.arch, electronVersion: '', chromeVersion: '', nodeVersion: '' };
  }
});

const SCHEDULED_TASK_NAME = 'CachePilot Scheduled Scan';

function createScheduledTask(intervalMinutes: number, exePath: string) {
  try {
    const cmd = `schtasks /create /tn "${SCHEDULED_TASK_NAME}" /tr "${exePath} --auto-start" /sc MINUTE /mo ${intervalMinutes} /f`;
    execSync(cmd, { stdio: 'pipe' });
    log.info(`Scheduled task created: every ${intervalMinutes} minutes`);
    return true;
  } catch (err) {
    log.error('Failed to create scheduled task', err);
    return false;
  }
}

function deleteScheduledTask() {
  try {
    execSync(`schtasks /delete /tn "${SCHEDULED_TASK_NAME}" /f`, { stdio: 'pipe' });
    log.info('Scheduled task deleted');
    return true;
  } catch (err) {
    log.error('Failed to delete scheduled task', err);
    return false;
  }
}

function isScheduledTaskActive(): boolean {
  try {
    const result = execSync(`schtasks /query /tn "${SCHEDULED_TASK_NAME}" /fo CSV /nh`, { stdio: 'pipe' }).toString();
    return result.includes(SCHEDULED_TASK_NAME);
  } catch {
    return false;
  }
}

ipcMain.handle('set-scheduled-scan', (_event, intervalMinutes: number) => {
  if (intervalMinutes <= 0) {
    return deleteScheduledTask();
  }
  const exePath = app.isPackaged
    ? path.join(path.dirname(app.getPath('exe')), 'CachePilot.exe')
    : process.execPath;
  return createScheduledTask(intervalMinutes, exePath);
});

ipcMain.handle('get-scheduled-scan', () => {
  return isScheduledTaskActive();
});

ipcMain.handle('cancel-scheduled-scan', () => {
  return deleteScheduledTask();
});

ipcMain.handle('open-logs-folder', async () => {
  try {
    const logDir = path.dirname(log.transports.file.getFile().path);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    await shell.openPath(logDir);
    return true;
  } catch (err) {
    log.error('Failed to open logs folder', err);
    return false;
  }
});

// --- License IPC Handlers ---

ipcMain.handle('activate-license', async (_event, licenseKey: string) => {
  return await activateLicense(licenseKey);
});

ipcMain.handle('get-license-status', () => {
  return getLicenseStatus();
});

ipcMain.handle('deactivate-license', () => {
  return deactivateLicense();
});

ipcMain.handle('get-scan-count', () => {
  const license = getLicenseStatus();
  return getScanCountForTier(license.tier === 'pro' && license.isValid);
});

ipcMain.handle('check-scan-limit', () => {
  const license = getLicenseStatus();
  const isPro = license.tier === 'pro' && license.isValid;
  const allowed = canScan(isPro);
  if (allowed && !isPro) {
    incrementScanCount();
  }
  return getScanCountForTier(isPro);
});

// Send license status to renderer on startup
function sendLicenseStatus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const status = getLicenseStatus();
    mainWindow.webContents.send('license-status', status);
  }
}
