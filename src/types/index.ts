export interface CacheCategory {
  id: string;
  name: string;
  description: string;
  whatItIs: string;
  whyItExists: string;
  whenToClean: string;
  whatMayChange: string;
  safetyLevel: 'safe' | 'caution' | 'risky';
  safetyNote: string;
  icon: string;
}

export interface ScanItem {
  id: string;
  categoryId: string;
  path: string;
  size: number;
  lastModified: string;
  status: 'found' | 'cleaned' | 'excluded';
}

export interface ScanSession {
  id: string;
  date: string;
  totalSize: number;
  itemCount: number;
  categories: CategoryResult[];
  status: 'completed' | 'in_progress' | 'failed';
  cleanedAt?: string;
  sizeFreed?: number;
  itemsCleaned?: number;
}

export interface CategoryResult {
  categoryId: string;
  name: string;
  itemCount: number;
  totalSize: number;
  safetyLevel: 'safe' | 'caution' | 'risky';
  isSelected: boolean;
}

export interface CleanupAction {
  id: string;
  scanSessionId: string;
  categoryId: string;
  date: string;
  itemsCleaned: number;
  sizeFreed: number;
  status: 'success' | 'partial' | 'failed';
  errors: string[];
}

export interface UserSetting {
  id: string;
  key: string;
  value: string;
  updatedAt: string;
}

export interface HistoryEvent {
  id: string;
  type: 'scan' | 'cleanup' | 'error';
  date: string;
  details: string;
  metadata?: string;
}

export interface CacheFile {
  path: string;
  size: number;
  lastModified: string;
}

export interface AppSettings {
  autoStart: boolean;
  autoScanOnStartup: boolean;
  autoScanInterval: number;
  showNotifications: boolean;
  notificationThresholdMB: number;
  showSafetyWarnings: boolean;
}

export interface ScanProgress {
  categoryId: string;
  categoryName: string;
  status: 'scanning' | 'done';
  itemCount?: number;
  totalSize?: number;
}

export interface AppInfo {
  version: string;
  name: string;
  platform: string;
  arch: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
}

export type UpdateStatusType = 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';

export interface UpdateStatus {
  status: UpdateStatusType;
  version?: string;
  releaseDate?: string;
  releaseNotes?: string;
  percent?: number;
  transferred?: number;
  total?: number;
  message?: string;
}

export interface LicenseStatus {
  tier: 'free' | 'pro';
  isValid: boolean;
  licenseKey?: string;
  activatedAt?: string;
  expiresAt?: string | null;
  deviceName?: string;
  error?: string;
}

export interface ScanCountInfo {
  count: number;
  limit: number;
  canScan: boolean;
  isPro: boolean;
}

export interface ElectronAPI {
  getDbPath: () => Promise<string>;
  openExternal: (url: string) => Promise<void>;
  scanCaches: () => Promise<{
    categoryId: string;
    items: CacheFile[];
    totalSize: number;
    itemCount: number;
  }[]>;
  deleteCacheFiles: (files: CacheFile[]) => Promise<{
    deleted: number;
    failed: number;
    errors: string[];
  }>;
  isAdmin: () => Promise<boolean>;
  requestElevation: () => Promise<void>;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  onScanProgress: (callback: (data: ScanProgress) => void) => () => void;
  onBackgroundScanComplete: (callback: (data: {
    totalSize: number;
    totalItems: number;
    categories: { categoryId: string; itemCount: number; totalSize: number }[];
  }) => void) => () => void;
  onTriggerScan: (callback: () => void) => () => void;
  minimizeToTray: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
  getUpdateStatus: () => Promise<UpdateStatus>;
  getAppInfo: () => Promise<AppInfo>;
  onUpdateStatus: (callback: (data: UpdateStatus) => void) => () => void;
  setScheduledScan: (intervalMinutes: number) => Promise<boolean>;
  getScheduledScan: () => Promise<boolean>;
  cancelScheduledScan: () => Promise<boolean>;
  openLogsFolder: () => Promise<boolean>;
  activateLicense: (key: string) => Promise<{ success: boolean; status: LicenseStatus; error?: string }>;
  getLicenseStatus: () => Promise<LicenseStatus>;
  deactivateLicense: () => Promise<{ success: boolean }>;
  getScanCount: () => Promise<ScanCountInfo>;
  checkScanLimit: () => Promise<ScanCountInfo>;
  onLicenseStatus: (callback: (status: LicenseStatus) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export type AppPage = 'dashboard' | 'scan' | 'history' | 'settings';

export interface AppState {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  scanProgress: ScanProgress[];
  setScanProgress: (progress: ScanProgress[]) => void;
  latestScan: ScanSession | null;
  setLatestScan: (scan: ScanSession | null) => void;
  scanHistory: ScanSession[];
  setScanHistory: (history: ScanSession[]) => void;
  settings: UserSetting[];
  setSettings: (settings: UserSetting[]) => void;
}