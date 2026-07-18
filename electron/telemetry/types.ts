export interface BaseTelemetryEvent {
  event: string;
  device_id: string;
  timestamp: string;
  app_version: string;
  os_version: string;
  os_build: string;
  arch: string;
  screen_width: number;
  screen_height: number;
  language: string;
  timezone: string;
  properties?: Record<string, unknown>;
}

export interface InstallEvent extends BaseTelemetryEvent {
  event: 'install';
  properties: {
    is_fresh: boolean;
    previous_version?: string;
  };
}

export interface LaunchEvent extends BaseTelemetryEvent {
  event: 'launch';
  properties: {
    is_first_launch: boolean;
    is_startup_scan_enabled: boolean;
    is_auto_scan_enabled: boolean;
    is_auto_clean_enabled: boolean;
    startup_time_ms: number;
  };
}

export interface HeartbeatEvent extends BaseTelemetryEvent {
  event: 'heartbeat';
  properties: {
    session_duration_ms: number;
    memory_usage_mb: number;
    active_page: string;
  };
}

export interface ShutdownEvent extends BaseTelemetryEvent {
  event: 'shutdown';
  properties: {
    session_duration_ms: number;
    pages_visited: string[];
  };
}

export interface ScanEvent extends BaseTelemetryEvent {
  event: 'scan_started' | 'scan_completed';
  properties: {
    scan_id: string;
    categories?: string[];
    total_files?: number;
    total_size_bytes?: number;
    duration_ms?: number;
    is_auto?: boolean;
    is_background?: boolean;
  };
}

export interface CleanupEvent extends BaseTelemetryEvent {
  event: 'cleanup_started' | 'cleanup_completed';
  properties: {
    scan_id: string;
    categories?: string[];
    total_files_cleaned?: number;
    bytes_cleaned?: number;
    duration_ms?: number;
    had_restore_point?: boolean;
    restore_point_created?: boolean;
  };
}

export interface RestorePointEvent extends BaseTelemetryEvent {
  event: 'restore_point_created' | 'restore_point_restored';
  properties: {
    scan_id: string;
    success: boolean;
    error_message?: string;
  };
}

export interface SettingsEvent extends BaseTelemetryEvent {
  event: 'settings_changed';
  properties: {
    setting: string;
    old_value: unknown;
    new_value: unknown;
  };
}

export interface AutoScanEvent extends BaseTelemetryEvent {
  event: 'auto_scan_triggered';
  properties: {
    trigger: 'startup' | 'schedule' | 'background';
    scan_id: string;
  };
}

export interface CrashEvent extends BaseTelemetryEvent {
  event: 'crash';
  properties: {
    crash_type: 'renderer' | 'main' | 'startup' | 'unhandled';
    error_message: string;
    stack_trace?: string;
    memory_usage_mb: number;
    active_page: string;
  };
}

export interface UpdateEvent extends BaseTelemetryEvent {
  event: 'update_check' | 'update_completed' | 'update_failed';
  properties: {
    current_version: string;
    latest_version?: string;
    update_available?: boolean;
    error_message?: string;
  };
}

export interface UninstallEvent extends BaseTelemetryEvent {
  event: 'uninstall';
  properties: {
    final_version: string;
    total_sessions: number;
    last_active: string;
  };
}

export type TelemetryEvent =
  | InstallEvent
  | LaunchEvent
  | HeartbeatEvent
  | ShutdownEvent
  | ScanEvent
  | CleanupEvent
  | RestorePointEvent
  | SettingsEvent
  | AutoScanEvent
  | CrashEvent
  | UpdateEvent
  | UninstallEvent;

export type TelemetryConsent = 'yes' | 'no' | 'unset';

export interface QueuedEvent {
  id: number;
  event: TelemetryEvent;
  attempts: number;
  lastAttempt?: string;
}
