import type { ScanSession } from '../types';

export interface HealthScore {
  score: number;
  label: 'Excellent' | 'Good' | 'Needs Attention';
  reason: string;
}

export function calculateHealthScore(
  session: ScanSession | null,
  history: ScanSession[]
): HealthScore {
  if (!session || session.status !== 'completed') {
    return { score: 70, label: 'Good', reason: 'Run a scan to check your PC health' };
  }

  let score = 100;
  const reasons: string[] = [];

  const totalMB = session.totalSize / (1024 * 1024);

  if (totalMB > 2000) {
    score -= 30;
    reasons.push(`${Math.round(totalMB)} MB of cache found`);
  } else if (totalMB > 1000) {
    score -= 20;
    reasons.push(`${Math.round(totalMB)} MB of cache accumulated`);
  } else if (totalMB > 500) {
    score -= 10;
    reasons.push(`${Math.round(totalMB)} MB of cache present`);
  } else if (totalMB < 50) {
    score += 5;
    reasons.push('Very little cache accumulated');
  }

  const totalItems = session.categories.reduce((sum, c) => sum + c.itemCount, 0);
  if (totalItems > 100000) {
    score -= 15;
    reasons.push(`${totalItems.toLocaleString()} cache files found`);
  } else if (totalItems > 50000) {
    score -= 8;
    reasons.push(`${totalItems.toLocaleString()} cache files present`);
  }

  const cleanedSessions = history.filter((s) => s.cleanedAt);
  if (cleanedSessions.length === 0) {
    score -= 10;
    reasons.push('No cleanups performed yet');
  } else if (cleanedSessions.length > 0 && cleanedSessions[0].cleanedAt) {
    const daysSince = Math.floor(
      (Date.now() - new Date(cleanedSessions[0].cleanedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSince > 30) {
      score -= 10;
      reasons.push(`Last cleanup was ${daysSince} days ago`);
    } else if (daysSince > 14) {
      score -= 5;
      reasons.push(`Last cleanup was ${daysSince} days ago`);
    } else if (daysSince <= 1) {
      score += 5;
      reasons.push('Recently cleaned');
    }
  }

  const totalFreed = cleanedSessions.reduce((sum, s) => sum + (s.sizeFreed ?? 0), 0);
  if (totalFreed > 1024 * 1024 * 1024) {
    score += 5;
    reasons.push(`${(totalFreed / (1024 * 1024 * 1024)).toFixed(1)} GB freed over time`);
  }

  score = Math.max(10, Math.min(99, score));

  let label: HealthScore['label'];
  if (score >= 85) {
    label = 'Excellent';
  } else if (score >= 65) {
    label = 'Good';
  } else {
    label = 'Needs Attention';
  }

  const reason = reasons.length > 0 ? reasons[0] : 'System health is good';

  return { score, label, reason };
}
