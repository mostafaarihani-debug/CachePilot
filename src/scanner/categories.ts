import type { CacheCategory } from '../types';

export const cacheCategories: CacheCategory[] = [
  {
    id: 'browser-cache',
    name: 'Browser Cache',
    description: 'Website images, scripts, and page files stored by your browser.',
    whatItIs: 'Stored website images, scripts, and page files that your browser saves to load sites faster.',
    whyItExists: 'Makes websites load faster by storing files locally instead of downloading them every time.',
    whenToClean: 'Clean when a site looks broken, outdated, or slow. Also useful when you need to free up space.',
    whatMayChange: 'Websites may load a little slower the first time after cleanup, but they will work normally after.',
    safetyLevel: 'safe',
    safetyNote: 'Low risk. You may need to wait a moment for sites to fully load after cleanup.',
    icon: 'Globe',
  },
  {
    id: 'cookies',
    name: 'Cookies and Site Data',
    description: 'Login sessions, preferences, and site-specific settings.',
    whatItIs: 'Login sessions, preferences, and site-specific settings saved by websites.',
    whyItExists: 'Keeps you signed in and remembers your choices on websites.',
    whenToClean: 'Clean when you have login problems, corrupted site state, or want to start fresh.',
    whatMayChange: 'You will be signed out of websites and may need to log in again.',
    safetyLevel: 'caution',
    safetyNote: 'You will be signed out of websites. Make sure you know your passwords before cleaning.',
    icon: 'Cookie',
  },
  {
    id: 'temp-files',
    name: 'Temporary Files',
    description: 'Short-lived files created by apps and installers.',
    whatItIs: 'Short-lived files created by applications and installers during normal operation.',
    whyItExists: 'Helps software work during installation, editing, or other temporary tasks.',
    whenToClean: 'Clean when you need to free up space or when apps are not working correctly.',
    whatMayChange: 'Usually no noticeable change. Apps will recreate temporary files as needed.',
    safetyLevel: 'safe',
    safetyNote: 'Low risk. Temporary files are designed to be deleted safely.',
    icon: 'FileTemporary',
  },
  {
    id: 'windows-update',
    name: 'Windows Update Cache',
    description: 'Downloaded update files stored by Windows.',
    whatItIs: 'Downloaded update files that Windows stores for installation and retries.',
    whyItExists: 'Supports update installation and allows Windows to retry failed updates.',
    whenToClean: 'Clean when updates are stuck, failing, or when storage is critically low.',
    whatMayChange: 'Windows may need to re-download update files, which could use internet data.',
    safetyLevel: 'caution',
    safetyNote: 'Windows may re-download update files. Only clean if you have update issues or need space urgently.',
    icon: 'Download',
  },
  {
    id: 'dns-cache',
    name: 'DNS Cache',
    description: 'Saved website name-to-IP address lookups.',
    whatItIs: 'Saved website name-to-IP address lookups that speed up network resolution.',
    whyItExists: 'Speeds up network resolution by storing website addresses locally.',
    whenToClean: 'Clean when websites fail to open because of stale DNS data or network issues.',
    whatMayChange: 'None important. The DNS cache rebuilds quickly as you browse.',
    safetyLevel: 'safe',
    safetyNote: 'No risk. DNS cache rebuilds automatically and has no side effects.',
    icon: 'Network',
  },
  {
    id: 'microsoft-store',
    name: 'Microsoft Store Cache',
    description: 'Store download and app installation cache.',
    whatItIs: 'Download and installation cache used by the Microsoft Store app.',
    whyItExists: 'Helps the Microsoft Store work faster and resume interrupted downloads.',
    whenToClean: 'Clean when Store apps fail to download, install, or update correctly.',
    whatMayChange: 'The Store may open a bit slower the first time after cleanup.',
    safetyLevel: 'safe',
    safetyNote: 'Low risk. The Store will rebuild its cache as needed.',
    icon: 'Store',
  },
  {
    id: 'thumbnails',
    name: 'Thumbnail Cache',
    description: 'Small preview images for files and folders.',
    whatItIs: 'Small preview images that Windows generates for files and folders.',
    whyItExists: 'Makes folders open faster with visual previews of file contents.',
    whenToClean: 'Clean when thumbnails are broken, outdated, or showing incorrect previews.',
    whatMayChange: 'Thumbnails will regenerate as you browse folders. This happens automatically.',
    safetyLevel: 'safe',
    safetyNote: 'No risk. Thumbnails rebuild automatically when you open folders.',
    icon: 'Image',
  },
  {
    id: 'icons',
    name: 'Icon Cache',
    description: 'Saved file and application icons.',
    whatItIs: 'Cached icons that Windows uses to display files and applications quickly.',
    whyItExists: 'Makes icons load quickly without regenerating them every time.',
    whenToClean: 'Clean when icons are missing, incorrect, or showing wrong images.',
    whatMayChange: 'Icons will rebuild after cleanup. This happens automatically in the background.',
    safetyLevel: 'safe',
    safetyNote: 'No risk. Icons rebuild automatically and have no side effects.',
    icon: 'LayoutGrid',
  },
  {
    id: 'prefetch',
    name: 'Prefetch Cache',
    description: 'Data Windows uses to help programs start faster.',
    whatItIs: 'Data that Windows collects to help programs start faster by pre-loading frequently used files.',
    whyItExists: 'Improves app launch performance by predicting what files apps need.',
    whenToClean: 'Clean when the cache is stale, corrupted, or when you suspect performance issues.',
    whatMayChange: 'Some apps may launch a bit slower at first while Windows rebuilds the prefetch data.',
    safetyLevel: 'caution',
    safetyNote: 'Apps may launch slower initially. Windows will rebuild this cache over time.',
    icon: 'Zap',
  },
  {
    id: 'gpu-shader',
    name: 'GPU and Shader Cache',
    description: 'Compiled graphics data used by games and graphics apps.',
    whatItIs: 'Compiled graphics shaders and textures used by games and graphics-intensive applications.',
    whyItExists: 'Reduces stutter and speeds up rendering by storing compiled graphics data.',
    whenToClean: 'Clean when games glitch, show visual artifacts, or when shaders are corrupted.',
    whatMayChange: 'Games may recompile shaders and stutter briefly the first time you play after cleanup.',
    safetyLevel: 'caution',
    safetyNote: 'Games may stutter briefly as they recompile shaders. This normalizes after a few minutes of play.',
    icon: 'Monitor',
  },
  {
    id: 'app-cache',
    name: 'App-Specific Cache',
    description: 'Temporary data stored by individual applications.',
    whatItIs: 'Temporary data stored by specific applications to improve performance.',
    whyItExists: 'Improves app performance and responsiveness by caching frequently used data.',
    whenToClean: 'Clean when an app is buggy, using too much space, or showing old data.',
    whatMayChange: 'The app may rebuild its cache and take longer the first time you use it.',
    safetyLevel: 'safe',
    safetyNote: 'Low risk. Apps will recreate their cache as needed for normal operation.',
    icon: 'Box',
  },
  {
    id: 'logs',
    name: 'Log Files',
    description: 'Diagnostic records written by apps and system components.',
    whatItIs: 'Diagnostic and activity records written by applications and Windows components.',
    whyItExists: 'Helps with troubleshooting by recording what apps and system components are doing.',
    whenToClean: 'Clean when log files become very large and you need to free up space.',
    whatMayChange: 'Older troubleshooting history will be removed. New logs will be created as needed.',
    safetyLevel: 'safe',
    safetyNote: 'Low risk. Only old troubleshooting data is removed. New logs are created as needed.',
    icon: 'FileText',
  },
];

export function getCategoryById(id: string): CacheCategory | undefined {
  return cacheCategories.find(cat => cat.id === id);
}

export function getCategorySafetyLevel(id: string): 'safe' | 'caution' | 'risky' {
  const category = getCategoryById(id);
  return category?.safetyLevel || 'safe';
}

export function getSafeCategories(): CacheCategory[] {
  return cacheCategories.filter(cat => cat.safetyLevel === 'safe');
}

export function getCautionCategories(): CacheCategory[] {
  return cacheCategories.filter(cat => cat.safetyLevel === 'caution');
}