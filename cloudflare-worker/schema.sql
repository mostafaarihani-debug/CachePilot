-- CachePilot Telemetry Database Schema
-- Cloudflare D1 (SQLite)

-- Raw events table (90-day retention)
CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  event         TEXT NOT NULL,
  device_id     TEXT NOT NULL,
  timestamp     TEXT NOT NULL,
  app_version   TEXT NOT NULL,
  os_version    TEXT NOT NULL,
  os_build      TEXT NOT NULL,
  arch          TEXT NOT NULL,
  screen_width  INTEGER,
  screen_height INTEGER,
  language      TEXT,
  timezone      TEXT,
  country       TEXT,
  properties    TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_event ON events(event);
CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_version ON events(app_version);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);

-- Device registry
CREATE TABLE IF NOT EXISTS devices (
  device_id        TEXT PRIMARY KEY,
  first_seen       TEXT NOT NULL,
  last_seen        TEXT NOT NULL,
  app_version      TEXT NOT NULL,
  os_version       TEXT NOT NULL,
  os_build         TEXT NOT NULL,
  arch             TEXT NOT NULL,
  language         TEXT,
  timezone         TEXT,
  country          TEXT,
  is_active        INTEGER DEFAULT 1,
  total_sessions   INTEGER DEFAULT 0,
  total_scans      INTEGER DEFAULT 0,
  total_cleanups   INTEGER DEFAULT 0,
  total_bytes_cleaned INTEGER DEFAULT 0,
  updated_at       TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen);
CREATE INDEX IF NOT EXISTS idx_devices_is_active ON devices(is_active);
CREATE INDEX IF NOT EXISTS idx_devices_os_version ON devices(os_version);

-- Daily aggregates
CREATE TABLE IF NOT EXISTS daily_stats (
  date      TEXT NOT NULL,
  metric    TEXT NOT NULL,
  value     INTEGER NOT NULL DEFAULT 0,
  dimension TEXT,
  PRIMARY KEY (date, metric, dimension)
);

-- Crash reports
CREATE TABLE IF NOT EXISTS crashes (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id       TEXT NOT NULL,
  timestamp       TEXT NOT NULL,
  app_version     TEXT NOT NULL,
  os_version      TEXT NOT NULL,
  crash_type      TEXT NOT NULL,
  error_message   TEXT,
  stack_trace     TEXT,
  memory_usage_mb INTEGER,
  active_page     TEXT,
  created_at      TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_crashes_device_id ON crashes(device_id);
CREATE INDEX IF NOT EXISTS idx_crashes_version ON crashes(app_version);
CREATE INDEX IF NOT EXISTS idx_crashes_type ON crashes(crash_type);
CREATE INDEX IF NOT EXISTS idx_crashes_created_at ON crashes(created_at);

-- Rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  device_id     TEXT NOT NULL,
  hour          TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  PRIMARY KEY (device_id, hour)
);
