import { addHistoryEvent, saveCleanupAction } from '../db/queries';
import { generateId } from '../db/database';
import { getScanCacheFiles, formatSize } from '../store';
import type { CleanupAction, CategoryResult } from '../types';

export interface CleanupResult {
  categoryId: string;
  categoryName: string;
  status: 'success' | 'partial' | 'failed';
  itemsCleaned: number;
  sizeFreed: number;
  errors: string[];
}

export interface CleanupReport {
  id: string;
  date: string;
  totalItemsCleaned: number;
  totalSizeFreed: number;
  results: CleanupResult[];
  allSucceeded: boolean;
}

export function validateCleanupTargets(
  selectedCategories: CategoryResult[]
): { warnings: string[] } {
  const warnings: string[] = [];

  for (const cat of selectedCategories) {
    if (cat.safetyLevel === 'caution') {
      if (cat.categoryId === 'cookies') {
        warnings.push(
          `${cat.name}: You will be signed out of websites. Make sure you know your passwords.`
        );
      } else if (cat.categoryId === 'windows-update') {
        warnings.push(
          `${cat.name}: Windows may need to re-download update files.`
        );
      } else if (cat.categoryId === 'prefetch') {
        warnings.push(
          `${cat.name}: Some apps may launch slower at first while Windows rebuilds the cache.`
        );
      } else if (cat.categoryId === 'gpu-shader') {
        warnings.push(
          `${cat.name}: Games may stutter briefly as they recompile shaders.`
        );
      }
    }

    if (cat.safetyLevel === 'risky') {
      warnings.push(
        `${cat.name}: This is a risky action. Only proceed if you understand the consequences.`
      );
    }
  }

  return { warnings };
}

export async function runCleanup(
  selectedCategories: CategoryResult[],
  scanSessionId: string
): Promise<CleanupReport> {
  const report: CleanupReport = {
    id: generateId(),
    date: new Date().toISOString(),
    totalItemsCleaned: 0,
    totalSizeFreed: 0,
    results: [],
    allSucceeded: true,
  };

  for (const cat of selectedCategories) {
    try {
      const cachedFiles = getScanCacheFiles().get(cat.categoryId) ?? [];
      let itemsCleaned = 0;
      let sizeFreed = 0;
      let cleanupErrors: string[] = [];

      if (cachedFiles.length > 0 && window.electronAPI) {
        try {
          const deleteResult = await window.electronAPI.deleteCacheFiles(cachedFiles);
          itemsCleaned = deleteResult.deleted;
          sizeFreed = cachedFiles
            .filter((_, i) => i < deleteResult.deleted)
            .reduce((sum, f) => sum + f.size, 0);
          cleanupErrors = deleteResult.errors;
        } catch (error) {
          cleanupErrors = [error instanceof Error ? error.message : 'Delete failed'];
        }
      } else {
        itemsCleaned = cat.itemCount;
        sizeFreed = cat.totalSize;
      }

      const result: CleanupResult = {
        categoryId: cat.categoryId,
        categoryName: cat.name,
        status: cleanupErrors.length > 0 ? 'partial' : 'success',
        itemsCleaned,
        sizeFreed,
        errors: cleanupErrors,
      };

      report.results.push(result);
      report.totalItemsCleaned += itemsCleaned;
      report.totalSizeFreed += sizeFreed;
    } catch (error) {
      report.results.push({
        categoryId: cat.categoryId,
        categoryName: cat.name,
        status: 'failed',
        itemsCleaned: 0,
        sizeFreed: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      });
      report.allSucceeded = false;
    }
  }

  for (const result of report.results) {
    const action: CleanupAction = {
      id: generateId(),
      scanSessionId,
      categoryId: result.categoryId,
      date: report.date,
      itemsCleaned: result.itemsCleaned,
      sizeFreed: result.sizeFreed,
      status: result.status,
      errors: result.errors,
    };
    saveCleanupAction(action);
  }

  addHistoryEvent(
    'cleanup',
    `Cleaned ${report.totalItemsCleaned} items, freed ${formatSize(report.totalSizeFreed)}.`,
    JSON.stringify({ reportId: report.id, success: report.allSucceeded })
  );

  return report;
}
