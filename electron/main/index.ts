import { app, BrowserWindow, ipcMain, shell, Menu, Notification, Tray, nativeImage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { scanAllCaches, scanAllCachesWithProgress, deleteCacheFiles } from './scanner';
import log from './logger';
import { initUpdater, checkForUpdates, downloadUpdate, quitAndInstall, getUpdateStatus } from './updater';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

app.name = 'CachePilot';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let autoScanTimer: ReturnType<typeof setInterval> | null = null;
let isQuitting = false;

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
      new Notification({
        title: 'CachePilot',
        body: `Found ${totalItems} cache files (${sizeMB} MB). Click to review and clean.`,
        silent: false,
      }).show();
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
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Scan Now',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send('trigger-scan');
        }
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

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function createWindow(startMinimized: boolean) {
  const boundsPath = path.join(app.getPath('userData'), 'window-bounds.json');
  let windowBounds: Electron.Rectangle | undefined;
  try {
    if (fs.existsSync(boundsPath)) {
      windowBounds = JSON.parse(fs.readFileSync(boundsPath, 'utf-8'));
    }
  } catch {}

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

  mainWindow.on('resize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        fs.writeFileSync(boundsPath, JSON.stringify(mainWindow.getBounds()));
      } catch {}
    }
  });

  mainWindow.on('move', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      try {
        fs.writeFileSync(boundsPath, JSON.stringify(mainWindow.getBounds()));
      } catch {}
    }
  });

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
  app.on('second-instance', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    log.info('CachePilot starting', { version: app.getVersion(), platform: process.platform, arch: process.arch });
    const settings = loadSettings();
    applyAutoStart(settings.autoStart);
    createTray();

    const isAutoStart = process.argv.includes('--auto-start');
    const startMinimized = isAutoStart;

    createWindow(startMinimized);
    initAutoScan(settings);
    log.info('CachePilot ready');

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
          });
          n.show();
        } catch {
          setTimeout(() => tryNotify(attempts - 1), 5000);
        }
      };
      setTimeout(() => tryNotify(3), 15000);
    }

    app.on('activate', () => {
      if (mainWindow) {
        mainWindow.show();
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
  return getUpdateStatus();
});

ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
  };
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
