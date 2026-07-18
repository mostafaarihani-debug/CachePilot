import { app, screen } from 'electron';
import os from 'node:os';
import type { BaseTelemetryEvent, TelemetryEvent } from './types';

function getBaseFields(deviceId: string): BaseTelemetryEvent {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  return {
    event: '',
    device_id: deviceId,
    timestamp: new Date().toISOString(),
    app_version: app.getVersion(),
    os_version: os.release(),
    os_build: os.version(),
    arch: process.arch,
    screen_width: width,
    screen_height: height,
    language: app.getLocale(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

export function buildInstallEvent(
  deviceId: string,
  isFresh: boolean,
  previousVersion?: string,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'install',
    properties: {
      is_fresh: isFresh,
      previous_version: previousVersion,
    },
  };
}

export function buildLaunchEvent(
  deviceId: string,
  isFirstLaunch: boolean,
  startupTimeMs: number,
  settings: {
    autoScanOnStartup: boolean;
    autoScanInterval: number;
    showNotifications: boolean;
    autoCleanAfterScan: boolean;
  },
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'launch',
    properties: {
      is_first_launch: isFirstLaunch,
      is_startup_scan_enabled: settings.autoScanOnStartup,
      is_auto_scan_enabled: settings.autoScanInterval > 0,
      is_auto_clean_enabled: settings.autoCleanAfterScan,
      startup_time_ms: startupTimeMs,
    },
  };
}

export function buildHeartbeatEvent(
  deviceId: string,
  sessionDurationMs: number,
  memoryUsageMb: number,
  activePage: string,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'heartbeat',
    properties: {
      session_duration_ms: sessionDurationMs,
      memory_usage_mb: memoryUsageMb,
      active_page: activePage,
    },
  };
}

export function buildShutdownEvent(
  deviceId: string,
  sessionDurationMs: number,
  pagesVisited: string[],
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'shutdown',
    properties: {
      session_duration_ms: sessionDurationMs,
      pages_visited: pagesVisited,
    },
  };
}

export function buildScanStartedEvent(
  deviceId: string,
  scanId: string,
  isAuto: boolean,
  isBackground: boolean,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'scan_started',
    properties: {
      scan_id: scanId,
      is_auto: isAuto,
      is_background: isBackground,
    },
  };
}

export function buildScanCompletedEvent(
  deviceId: string,
  scanId: string,
  categories: string[],
  totalFiles: number,
  totalSizeBytes: number,
  durationMs: number,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'scan_completed',
    properties: {
      scan_id: scanId,
      categories,
      total_files: totalFiles,
      total_size_bytes: totalSizeBytes,
      duration_ms: durationMs,
    },
  };
}

export function buildCleanupStartedEvent(
  deviceId: string,
  scanId: string,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'cleanup_started',
    properties: {
      scan_id: scanId,
    },
  };
}

export function buildCleanupCompletedEvent(
  deviceId: string,
  scanId: string,
  categories: string[],
  totalFilesCleaned: number,
  bytesCleaned: number,
  durationMs: number,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'cleanup_completed',
    properties: {
      scan_id: scanId,
      categories,
      total_files_cleaned: totalFilesCleaned,
      bytes_cleaned: bytesCleaned,
      duration_ms: durationMs,
    },
  };
}

export function buildSettingsChangedEvent(
  deviceId: string,
  setting: string,
  oldValue: unknown,
  newValue: unknown,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'settings_changed',
    properties: {
      setting,
      old_value: oldValue,
      new_value: newValue,
    },
  };
}

export function buildAutoScanEvent(
  deviceId: string,
  trigger: 'startup' | 'schedule' | 'background',
  scanId: string,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'auto_scan_triggered',
    properties: {
      trigger,
      scan_id: scanId,
    },
  };
}

export function buildCrashEvent(
  deviceId: string,
  crashType: 'renderer' | 'main' | 'startup' | 'unhandled',
  errorMessage: string,
  stackTrace: string | undefined,
  activePage: string,
): TelemetryEvent {
  const memUsage = process.memoryUsage();
  return {
    ...getBaseFields(deviceId),
    event: 'crash',
    properties: {
      crash_type: crashType,
      error_message: errorMessage,
      stack_trace: stackTrace,
      memory_usage_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      active_page: activePage,
    },
  };
}

export function buildUpdateEvent(
  deviceId: string,
  eventType: 'update_check' | 'update_completed' | 'update_failed',
  currentVersion: string,
  latestVersion?: string,
  updateAvailable?: boolean,
  errorMessage?: string,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: eventType,
    properties: {
      current_version: currentVersion,
      latest_version: latestVersion,
      update_available: updateAvailable,
      error_message: errorMessage,
    },
  };
}

export function buildUninstallEvent(
  deviceId: string,
  finalVersion: string,
  totalSessions: number,
  lastActive: string,
): TelemetryEvent {
  return {
    ...getBaseFields(deviceId),
    event: 'uninstall',
    properties: {
      final_version: finalVersion,
      total_sessions: totalSessions,
      last_active: lastActive,
    },
  };
}
