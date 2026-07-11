import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow } from 'electron';
import log from './logger';

let mainWindow: BrowserWindow | null = null;
let isCheckingForUpdates = false;
let updateAvailable = false;
let latestUpdateInfo: UpdateInfo | null = null;

function sendToRenderer(channel: string, ...args: unknown[]) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, ...args);
  }
}

export function initUpdater(window: BrowserWindow) {
  mainWindow = window;

  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    isCheckingForUpdates = true;
    sendToRenderer('update-status', { status: 'checking' });
    log.info('Checking for updates...');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    isCheckingForUpdates = false;
    updateAvailable = true;
    latestUpdateInfo = info;
    sendToRenderer('update-status', {
      status: 'available',
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes || 'No release notes available.',
    });
    log.info(`Update available: v${info.version}`);
  });

  autoUpdater.on('update-not-available', () => {
    isCheckingForUpdates = false;
    updateAvailable = false;
    latestUpdateInfo = null;
    sendToRenderer('update-status', { status: 'not-available' });
    log.info('No update available');
  });

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('update-status', {
      status: 'downloading',
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    });
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    sendToRenderer('update-status', {
      status: 'downloaded',
      version: info.version,
    });
    log.info(`Update downloaded: v${info.version}`);
  });

  autoUpdater.on('error', (err: Error) => {
    isCheckingForUpdates = false;
    sendToRenderer('update-status', { status: 'error', message: err.message });
    log.error('Update error', err);
  });
}

export async function checkForUpdates() {
  if (isCheckingForUpdates) {
    log.info('Already checking for updates, skipping');
    return;
  }
  try {
    await autoUpdater.checkForUpdates();
  } catch (err) {
    log.error('Failed to check for updates', err);
    sendToRenderer('update-status', {
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to check for updates',
    });
  }
}

export async function downloadUpdate() {
  if (!updateAvailable) {
    log.info('No update available to download');
    return;
  }
  try {
    log.info('Starting update download...');
    await autoUpdater.downloadUpdate();
  } catch (err) {
    log.error('Failed to download update', err);
    sendToRenderer('update-status', {
      status: 'error',
      message: err instanceof Error ? err.message : 'Failed to download update',
    });
  }
}

export function quitAndInstall() {
  log.info('Quitting and installing update');
  autoUpdater.quitAndInstall(false, true);
}

export function getUpdateStatus() {
  return {
    isChecking: isCheckingForUpdates,
    updateAvailable,
    updateInfo: latestUpdateInfo,
  };
}
