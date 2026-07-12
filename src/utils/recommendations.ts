import type { ScanSession } from '../types';

export interface Recommendation {
  id: string;
  type: 'info' | 'action' | 'positive';
  title: string;
  description: string;
}

export function generateRecommendations(
  session: ScanSession,
  history: ScanSession[]
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (!session || session.status !== 'completed') return recs;

  const totalMB = session.totalSize / (1024 * 1024);
  const categoriesWithData = session.categories.filter((c) => c.itemCount > 0);
  const allClean = categoriesWithData.length === 0;

  if (allClean) {
    recs.push({
      id: 'system-clean',
      type: 'positive',
      title: 'Your system is already clean',
      description: 'No cache files found that need attention. Your PC is in great shape.',
    });
    return recs;
  }

  if (totalMB < 50) {
    recs.push({
      id: 'no-cleanup-needed',
      type: 'positive',
      title: 'No cleanup is recommended right now',
      description: `Your cache is only ${Math.round(totalMB)} MB, which is small and not worth cleaning right now.`,
    });
  }

  const browserCat = session.categories.find((c) => c.categoryId === 'browser-cache');
  if (browserCat && browserCat.totalSize > 200 * 1024 * 1024) {
    recs.push({
      id: 'large-browser-cache',
      type: 'action',
      title: 'Your browser cache is larger than usual',
      description: `At ${(browserCat.totalSize / (1024 * 1024)).toFixed(0)} MB, your browser cache is taking up significant space. Cleaning it is safe and will free space immediately.`,
    });
  } else if (browserCat && browserCat.totalSize > 100 * 1024 * 1024) {
    recs.push({
      id: 'browser-cache-medium',
      type: 'info',
      title: 'Browser cache is building up',
      description: `Your browser cache is ${(browserCat.totalSize / (1024 * 1024)).toFixed(0)} MB. Cleaning it periodically helps keep your browser running smoothly.`,
    });
  }

  const tempCat = session.categories.find((c) => c.categoryId === 'temp-files');
  if (tempCat && tempCat.totalSize > 500 * 1024 * 1024) {
    recs.push({
      id: 'large-temp-files',
      type: 'action',
      title: 'Temporary files are using a lot of space',
      description: `Over ${(tempCat.totalSize / (1024 * 1024)).toFixed(0)} MB of temporary files found. These are safe to clean and will not affect your apps.`,
    });
  }

  const updateCat = session.categories.find((c) => c.categoryId === 'windows-update');
  if (updateCat && updateCat.totalSize > 300 * 1024 * 1024) {
    recs.push({
      id: 'windows-update-cache',
      type: 'info',
      title: 'Windows Update cache can safely be cleaned',
      description: `Windows Update cache is ${(updateCat.totalSize / (1024 * 1024)).toFixed(0)} MB. This contains old update files that are no longer needed. Cleaning is safe.`,
    });
  }

  const totalItems = session.categories.reduce((sum, c) => sum + c.itemCount, 0);
  if (totalItems > 50000) {
    recs.push({
      id: 'many-files',
      type: 'info',
      title: 'Large number of cache files found',
      description: `Found ${totalItems.toLocaleString()} cache files across your system. Cleaning will reduce file clutter and may improve disk performance.`,
    });
  }

  const cleanedSessions = history.filter((s) => s.cleanedAt);
  if (cleanedSessions.length === 0 && totalMB > 100) {
    recs.push({
      id: 'never-cleaned',
      type: 'action',
      title: 'You have never cleaned your cache',
      description: 'This is your first scan. Cleaning safe categories now will give your PC a fresh start.',
    });
  }

  if (cleanedSessions.length > 0) {
    const lastCleaned = cleanedSessions[0];
    if (lastCleaned.cleanedAt) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lastCleaned.cleanedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 14) {
        recs.push({
          id: 'cleanup-overdue',
          type: 'info',
          title: 'It has been a while since your last cleanup',
          description: `Last cleanup was ${daysSince} days ago. A periodic cleanup helps keep your system running well.`,
        });
      }
    }
  }

  const safeCatsWithSize = categoriesWithData.filter(
    (c) => c.safetyLevel === 'safe' && c.totalSize > 10 * 1024 * 1024
  );
  if (safeCatsWithSize.length >= 3) {
    recs.push({
      id: 'quick-win',
      type: 'action',
      title: 'Quick cleanup available',
      description: `${safeCatsWithSize.length} safe categories have cache that can be cleaned right now with no side effects.`,
    });
  }

  if (recs.length === 0 && !allClean) {
    recs.push({
      id: 'general-tip',
      type: 'info',
      title: 'Cache is at a normal level',
      description: 'Your cache usage looks typical. No urgent cleanup is needed.',
    });
  }

  return recs.slice(0, 4);
}
