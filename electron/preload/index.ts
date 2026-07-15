// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron');

function createListener(channel: string, callback: (...args: unknown[]) => void) {
  const handler = (_event: unknown, ...args: unknown[]) => callback(...args);
  ipcRenderer.on(channel, handler);
  return () => {
    ipcRenderer.removeListener(channel, handler);
  };
}

contextBridge.exposeInMainWorld('electronAPI', {
  getDbPath: () => ipcRenderer.invoke('get-db-path'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  scanCaches: () => ipcRenderer.invoke('scan-caches'),
  deleteCacheFiles: (files: { path: string; size: number; lastModified: string }[]) =>
    ipcRenderer.invoke('delete-cache-files', files),
  isAdmin: () => ipcRenderer.invoke('is-admin'),
  requestElevation: () => ipcRenderer.invoke('request-elevation'),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke('save-settings', settings),
  onScanProgress: (callback: (data: { categoryId: string; categoryName: string; status: string; itemCount?: number; totalSize?: number }) => void) =>
    createListener('scan-progress', (data: unknown) => callback(data as { categoryId: string; categoryName: string; status: string; itemCount?: number; totalSize?: number })),
  onBackgroundScanComplete: (callback: (data: unknown) => void) =>
    createListener('background-scan-complete', (data: unknown) => callback(data)),
  onTriggerScan: (callback: () => void) =>
    createListener('trigger-scan', () => callback()),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  getUpdateStatus: () => ipcRenderer.invoke('get-update-status'),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  onUpdateStatus: (callback: (data: unknown) => void) =>
    createListener('update-status', (data: unknown) => callback(data)),
  setScheduledScan: (intervalMinutes: number) => ipcRenderer.invoke('set-scheduled-scan', intervalMinutes),
  getScheduledScan: () => ipcRenderer.invoke('get-scheduled-scan'),
  cancelScheduledScan: () => ipcRenderer.invoke('cancel-scheduled-scan'),
  openLogsFolder: () => ipcRenderer.invoke('open-logs-folder'),
  activateLicense: (key: string) => ipcRenderer.invoke('activate-license', key),
  getLicenseStatus: () => ipcRenderer.invoke('get-license-status'),
  deactivateLicense: () => ipcRenderer.invoke('deactivate-license'),
  getScanCount: () => ipcRenderer.invoke('get-scan-count'),
  checkScanLimit: () => ipcRenderer.invoke('check-scan-limit'),
  onLicenseStatus: (callback: (status: unknown) => void) =>
    createListener('license-status', (status: unknown) => callback(status)),
});
