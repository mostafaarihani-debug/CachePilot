import fs from 'fs';
import path from 'path';
import os from 'os';
import log from './logger';

export interface CacheLocation {
  categoryId: string;
  name: string;
  paths: string[];
}

export interface ScanResult {
  categoryId: string;
  items: CacheFile[];
  totalSize: number;
  itemCount: number;
}

export interface CacheFile {
  path: string;
  size: number;
  lastModified: string;
}

const CACHE_LOCATIONS: CacheLocation[] = [
  {
    categoryId: 'browser-cache',
    name: 'Browser Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Cache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Code Cache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Cache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Code Cache'),
    ],
  },
  {
    categoryId: 'cookies',
    name: 'Cookies and Site Data',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Cookies'),
      path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'Local Storage'),
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'Cookies'),
    ],
  },
  {
    categoryId: 'temp-files',
    name: 'Temporary Files',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Temp'),
      'C:\\Windows\\Temp',
    ],
  },
  {
    categoryId: 'windows-update',
    name: 'Windows Update Cache',
    paths: [
      'C:\\Windows\\SoftwareDistribution\\Download',
      'C:\\Windows\\SoftwareDistribution\\DataStore',
    ],
  },
  {
    categoryId: 'dns-cache',
    name: 'DNS Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'INetCache'),
    ],
  },
  {
    categoryId: 'microsoft-store',
    name: 'Microsoft Store Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Packages', 'Microsoft.WindowsStore_8wekyb3d8bbwe', 'LocalCache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'INetCache'),
    ],
  },
  {
    categoryId: 'thumbnails',
    name: 'Thumbnail Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'Explorer'),
    ],
  },
  {
    categoryId: 'icons',
    name: 'Icon Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'Explorer'),
    ],
  },
  {
    categoryId: 'prefetch',
    name: 'Prefetch Cache',
    paths: [
      'C:\\Windows\\Prefetch',
    ],
  },
  {
    categoryId: 'gpu-shader',
    name: 'GPU and Shader Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'NVIDIA', 'DXCache'),
      path.join(os.homedir(), 'AppData', 'Local', 'NVIDIA', 'GLCache'),
      path.join(os.homedir(), 'AppData', 'Local', 'AMD', 'VulkanCache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Intel', 'ShaderCache'),
    ],
  },
  {
    categoryId: 'app-cache',
    name: 'App-Specific Cache',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Discord', 'Cache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Slack', 'Cache'),
      path.join(os.homedir(), 'AppData', 'Local', 'Spotify', 'Storage'),
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Teams', 'Cache'),
    ],
  },
  {
    categoryId: 'logs',
    name: 'Log Files',
    paths: [
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'WER', 'ReportArchive'),
      path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Windows', 'WER', 'ReportQueue'),
      'C:\\Windows\\Logs',
    ],
  },
];

function getDirSize(dirPath: string, depth: number = 0): { size: number; count: number; files: CacheFile[] } {
  if (depth > 8) return { size: 0, count: 0, files: [] };

  let size = 0;
  let count = 0;
  const files: CacheFile[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return { size: 0, count: 0, files: [] };
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    try {
      if (entry.isDirectory()) {
        const sub = getDirSize(fullPath, depth + 1);
        size += sub.size;
        count += sub.count;
        files.push(...sub.files);
      } else {
        let fileStats: fs.Stats;
        try {
          fileStats = fs.statSync(fullPath);
        } catch {
          continue;
        }
        const fileSize = fileStats.size;
        size += fileSize;
        count++;
        files.push({
          path: fullPath,
          size: fileSize,
          lastModified: fileStats.mtime.toISOString(),
        });
      }
    } catch {
      continue;
    }
  }

  return { size, count, files };
}

function safeExistsSync(p: string): boolean {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function scanCacheLocation(location: CacheLocation): ScanResult {
  let totalSize = 0;
  let itemCount = 0;
  const allFiles: CacheFile[] = [];

  for (const cachePath of location.paths) {
    try {
      if (!safeExistsSync(cachePath)) continue;

      const stats = fs.statSync(cachePath);
      if (!stats.isDirectory()) continue;

      const result = getDirSize(cachePath);
      totalSize += result.size;
      itemCount += result.count;
      allFiles.push(...result.files);
    } catch {
      continue;
    }
  }

  return {
    categoryId: location.categoryId,
    items: allFiles.slice(0, 500),
    totalSize,
    itemCount,
  };
}

export function scanAllCaches(): ScanResult[] {
  return CACHE_LOCATIONS.map((loc) => scanCacheLocation(loc));
}

export function getCacheLocations(): CacheLocation[] {
  return CACHE_LOCATIONS;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function scanAllCachesWithProgress(
  onProgress: (categoryId: string, categoryName: string, status: 'scanning' | 'done', itemCount?: number, totalSize?: number) => void
): Promise<ScanResult[]> {
  return (async () => {
    const results: ScanResult[] = [];
    log.info('Scan started, scanning all cache categories');
    for (const loc of CACHE_LOCATIONS) {
      onProgress(loc.categoryId, loc.name, 'scanning');
      const result = scanCacheLocation(loc);
      results.push(result);
      onProgress(loc.categoryId, loc.name, 'done', result.itemCount, result.totalSize);
      log.info(`  ${loc.name}: ${result.itemCount} items, ${(result.totalSize / 1024 / 1024).toFixed(1)} MB`);
      const delay = 200 + Math.random() * 50;
      await sleep(delay);
    }
    const totalSize = results.reduce((sum, r) => sum + r.totalSize, 0);
    const totalItems = results.reduce((sum, r) => sum + r.itemCount, 0);
    log.info(`Scan complete: ${(totalSize / 1024 / 1024).toFixed(1)} MB across ${totalItems} items`);
    return results;
  })();
}

export function deleteCacheFiles(files: CacheFile[]): { deleted: number; failed: number; errors: string[] } {
  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];
  log.info(`Delete started, ${files.length} files queued`);

  for (const file of files) {
    try {
      if (safeExistsSync(file.path)) {
        const stats = fs.statSync(file.path);
        if (stats.isDirectory()) {
          fs.rmSync(file.path, { recursive: true, force: true });
        } else {
          fs.unlinkSync(file.path);
        }
        deleted++;
      }
    } catch (error) {
      failed++;
      if (errors.length < 10) {
        errors.push(`${file.path}: ${error instanceof Error ? error.message : 'Access denied'}`);
      }
    }
  }

  log.info(`Delete complete: ${deleted} deleted, ${failed} failed`);
  return { deleted, failed, errors };
}
