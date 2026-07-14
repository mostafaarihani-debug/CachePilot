import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import log from './logger';

const SCAN_COUNT_PATH = path.join(app.getPath('userData'), 'scan-count.json');
const FREE_DAILY_LIMIT = 3;

interface ScanCountData {
  date: string;
  count: number;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function loadScanCount(): ScanCountData {
  try {
    if (fs.existsSync(SCAN_COUNT_PATH)) {
      const data = JSON.parse(fs.readFileSync(SCAN_COUNT_PATH, 'utf-8')) as ScanCountData;
      if (data.date === getToday()) {
        return data;
      }
      // Date changed — reset count
      return { date: getToday(), count: 0 };
    }
  } catch (err) {
    log.error('Failed to load scan count', err);
  }
  return { date: getToday(), count: 0 };
}

function saveScanCount(data: ScanCountData) {
  try {
    fs.writeFileSync(SCAN_COUNT_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    log.error('Failed to save scan count', err);
  }
}

export function getScanCount(): { count: number; limit: number; canScan: boolean; isPro: boolean } {
  const data = loadScanCount();
  return {
    count: data.count,
    limit: FREE_DAILY_LIMIT,
    canScan: data.count < FREE_DAILY_LIMIT,
    isPro: false,
  };
}

export function getScanCountForTier(isPro: boolean): { count: number; limit: number; canScan: boolean; isPro: boolean } {
  const data = loadScanCount();
  if (isPro) {
    return { count: data.count, limit: Infinity, canScan: true, isPro: true };
  }
  return {
    count: data.count,
    limit: FREE_DAILY_LIMIT,
    canScan: data.count < FREE_DAILY_LIMIT,
    isPro: false,
  };
}

export function incrementScanCount(): ScanCountData {
  const data = loadScanCount();
  data.count += 1;
  saveScanCount(data);
  log.info(`Scan count incremented: ${data.count}/${FREE_DAILY_LIMIT}`);
  return data;
}

export function canScan(isPro: boolean): boolean {
  if (isPro) return true;
  const data = loadScanCount();
  return data.count < FREE_DAILY_LIMIT;
}
