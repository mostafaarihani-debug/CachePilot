import { create } from 'zustand';
import type { AppState, ScanSession, CategoryResult, CacheFile, ScanProgress } from '../types';
import { cacheCategories } from '../scanner/categories';
import { saveScanSession, getLatestScan, getScanHistory, addHistoryEvent } from '../db/queries';
import { generateId } from '../db/database';

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),

  isScanning: false,
  setIsScanning: (scanning) => set({ isScanning: scanning }),

  scanProgress: [],
  setScanProgress: (progress) => set({ scanProgress: progress }),

  latestScan: null,
  setLatestScan: (scan) => set({ latestScan: scan }),

  scanHistory: [],
  setScanHistory: (history) => set({ scanHistory: history }),

  settings: [],
  setSettings: (settings) => set({ settings }),
}));

let scanCacheFiles: Map<string, CacheFile[]> = new Map();

export function getScanCacheFiles(): Map<string, CacheFile[]> {
  return scanCacheFiles;
}

export async function runScan(): Promise<ScanSession> {
  const store = useAppStore.getState();
  store.setIsScanning(true);
  store.setScanProgress([]);
  store.setLatestScan(null);

  scanCacheFiles = new Map();

  let rawResults: { categoryId: string; items: CacheFile[]; totalSize: number; itemCount: number }[] = [];

  if (window.electronAPI) {
    try {
      // Listen for progress events
      const progressHandler = (data: ScanProgress) => {
        const current = useAppStore.getState().scanProgress;
        const existing = current.findIndex((p) => p.categoryId === data.categoryId);
        if (existing >= 0) {
          const next = [...current];
          next[existing] = data;
          useAppStore.setState({ scanProgress: next });
        } else {
          useAppStore.setState({ scanProgress: [...current, data] });
        }
      };

      window.electronAPI.onScanProgress(progressHandler);
      rawResults = await window.electronAPI.scanCaches();
    } catch {
      rawResults = [];
    }
  }

  const categories: CategoryResult[] = cacheCategories.map((cat) => {
    const result = rawResults.find((r) => r.categoryId === cat.id);
    const totalSize = result?.totalSize ?? 0;
    const itemCount = result?.itemCount ?? 0;
    const items = result?.items ?? [];

    if (items.length > 0) {
      scanCacheFiles.set(cat.id, items);
    }

    return {
      categoryId: cat.id,
      name: cat.name,
      itemCount,
      totalSize,
      safetyLevel: cat.safetyLevel,
      isSelected: cat.safetyLevel === 'safe',
    };
  });

  const totalSize = categories.reduce((sum, cat) => sum + cat.totalSize, 0);
  const itemCount = categories.reduce((sum, cat) => sum + cat.itemCount, 0);

  const session: ScanSession = {
    id: generateId(),
    date: new Date().toISOString(),
    totalSize,
    itemCount,
    categories,
    status: 'completed',
  };

  saveScanSession(session);
  addHistoryEvent('scan', `Scan completed. Found ${formatSize(totalSize)} across ${itemCount} items in ${categories.filter(c => c.itemCount > 0).length} categories.`);

  store.setLatestScan(session);
  store.setIsScanning(false);
  store.setScanProgress([]);

  const history = getScanHistory();
  store.setScanHistory(history);

  return session;
}

export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function loadInitialData(): void {
  const store = useAppStore.getState();

  const latestScan = getLatestScan();
  store.setLatestScan(latestScan);

  const history = getScanHistory();
  store.setScanHistory(history);
}