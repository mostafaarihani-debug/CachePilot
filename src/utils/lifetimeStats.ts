import type { ScanSession } from '../types';

export interface LifetimeStats {
  totalScans: number;
  totalCleanups: number;
  totalFilesRemoved: number;
  totalSpaceFreed: number;
  largestCleanup: number;
  averageCleanupSize: number;
  firstScanDate: string | null;
  lastCleanupDate: string | null;
}

function getDefaultStats(): LifetimeStats {
  return {
    totalScans: 0,
    totalCleanups: 0,
    totalFilesRemoved: 0,
    totalSpaceFreed: 0,
    largestCleanup: 0,
    averageCleanupSize: 0,
    firstScanDate: null,
    lastCleanupDate: null,
  };
}

export function recalcLifetimeStats(history: ScanSession[]): LifetimeStats {
  const stats = getDefaultStats();

  stats.totalScans = history.length;

  const cleaned = history.filter((s) => s.cleanedAt && s.sizeFreed != null);
  stats.totalCleanups = cleaned.length;

  stats.totalFilesRemoved = cleaned.reduce((sum, s) => {
    return sum + (s.itemsCleaned ?? 0);
  }, 0);

  stats.totalSpaceFreed = cleaned.reduce((sum, s) => sum + (s.sizeFreed ?? 0), 0);

  const cleanupSizes = cleaned.map((s) => s.sizeFreed ?? 0).filter((s) => s > 0);
  stats.largestCleanup = cleanupSizes.length > 0 ? Math.max(...cleanupSizes) : 0;
  stats.averageCleanupSize =
    cleanupSizes.length > 0
      ? Math.round(cleanupSizes.reduce((a, b) => a + b, 0) / cleanupSizes.length)
      : 0;

  if (history.length > 0) {
    const sorted = [...history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    stats.firstScanDate = sorted[0].date;
  }

  if (cleaned.length > 0) {
    const sortedCleanups = [...cleaned].sort(
      (a, b) => new Date(b.cleanedAt!).getTime() - new Date(a.cleanedAt!).getTime()
    );
    stats.lastCleanupDate = sortedCleanups[0].cleanedAt!;
  }

  return stats;
}
