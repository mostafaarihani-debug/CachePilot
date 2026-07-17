import { app } from 'electron';
import { getOrCreateDeviceId } from './deviceId';
import { hasConsent, getConsent } from './consent';
import {
  enqueueEvent,
  getQueuedEventBatch,
  markEventAttempted,
  removeSuccessfulEvents,
  getQueueSize,
} from './queue';
import { sendEvents, sendCrashReport } from './api';
import {
  buildInstallEvent,
  buildLaunchEvent,
  buildHeartbeatEvent,
  buildShutdownEvent,
  buildScanStartedEvent,
  buildScanCompletedEvent,
  buildCleanupStartedEvent,
  buildCleanupCompletedEvent,
  buildSettingsChangedEvent,
  buildAutoScanEvent,
  buildCrashEvent,
  buildUpdateEvent,
} from './events';
import type { TelemetryConsent } from './types';
import log from '../main/logger';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const SYNC_INTERVAL_MS = 30 * 1000;
const BATCH_SIZE = 50;

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let syncTimer: ReturnType<typeof setInterval> | null = null;
let sessionStartTime = Date.now();
let pagesVisited = new Set<string>();
let isInitialized = false;

function shouldTrack(): boolean {
  return hasConsent();
}

async function flushQueue(): Promise<void> {
  if (!shouldTrack()) return;

  const batch = getQueuedEventBatch(BATCH_SIZE);
  if (batch.length === 0) return;

  const events = batch.map((q) => q.event);
  const ids = batch.map((q) => q.id);

  const ok = await sendEvents(events);
  if (ok) {
    removeSuccessfulEvents(ids);
    log.debug(`Telemetry: flushed ${events.length} events`);
  } else {
    markEventAttempted(ids);
  }
}

function startSyncWorker(): void {
  if (syncTimer) return;
  syncTimer = setInterval(() => {
    flushQueue();
  }, SYNC_INTERVAL_MS);
}

function stopSyncWorker(): void {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

function startHeartbeat(): void {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(() => {
    if (!shouldTrack()) return;
    const deviceId = getOrCreateDeviceId();
    const memUsage = process.memoryUsage();
    const event = buildHeartbeatEvent(
      deviceId,
      Date.now() - sessionStartTime,
      Math.round(memUsage.heapUsed / 1024 / 1024),
      'unknown',
    );
    enqueueEvent(event);
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

export function initTelemetry(): void {
  if (isInitialized) return;
  isInitialized = true;
  sessionStartTime = Date.now();

  log.info('Telemetry initializing', { consent: getConsent() });

  startSyncWorker();

  if (shouldTrack()) {
    startHeartbeat();
    flushQueue();
  }

  app.on('before-quit', () => {
    sendShutdownEvent();
    stopHeartbeat();
    stopSyncWorker();
  });
}

export function onConsentChanged(consent: TelemetryConsent): void {
  if (consent === 'yes') {
    startHeartbeat();
    flushQueue();
  } else {
    stopHeartbeat();
  }
}

export function trackInstall(isFresh: boolean, previousVersion?: string): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildInstallEvent(deviceId, isFresh, previousVersion);
  enqueueEvent(event);
}

export function trackLaunch(isFirstLaunch: boolean, startupTimeMs: number, settings: {
  autoScanOnStartup: boolean;
  autoScanInterval: number;
  showNotifications: boolean;
}): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildLaunchEvent(deviceId, isFirstLaunch, startupTimeMs, settings);
  enqueueEvent(event);
}

export function trackScanStarted(scanId: string, isAuto: boolean, isBackground: boolean): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildScanStartedEvent(deviceId, scanId, isAuto, isBackground);
  enqueueEvent(event);
}

export function trackScanCompleted(
  scanId: string,
  categories: string[],
  totalFiles: number,
  totalSizeBytes: number,
  durationMs: number,
): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildScanCompletedEvent(deviceId, scanId, categories, totalFiles, totalSizeBytes, durationMs);
  enqueueEvent(event);
}

export function trackCleanupStarted(scanId: string): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildCleanupStartedEvent(deviceId, scanId);
  enqueueEvent(event);
}

export function trackCleanupCompleted(
  scanId: string,
  categories: string[],
  totalFilesCleaned: number,
  bytesCleaned: number,
  durationMs: number,
): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildCleanupCompletedEvent(deviceId, scanId, categories, totalFilesCleaned, bytesCleaned, durationMs);
  enqueueEvent(event);
}

export function trackSettingsChanged(setting: string, oldValue: unknown, newValue: unknown): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildSettingsChangedEvent(deviceId, setting, oldValue, newValue);
  enqueueEvent(event);
}

export function trackAutoScan(trigger: 'startup' | 'schedule' | 'background', scanId: string): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildAutoScanEvent(deviceId, trigger, scanId);
  enqueueEvent(event);
}

export function trackCrash(
  crashType: 'renderer' | 'main' | 'startup' | 'unhandled',
  errorMessage: string,
  stackTrace: string | undefined,
  activePage: string,
): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildCrashEvent(deviceId, crashType, errorMessage, stackTrace, activePage);

  sendCrashReport(event).catch(() => {
    enqueueEvent(event);
  });
}

export function trackUpdate(
  eventType: 'update_check' | 'update_completed' | 'update_failed',
  currentVersion: string,
  latestVersion?: string,
  updateAvailable?: boolean,
  errorMessage?: string,
): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildUpdateEvent(deviceId, eventType, currentVersion, latestVersion, updateAvailable, errorMessage);
  enqueueEvent(event);
}

function sendShutdownEvent(): void {
  if (!shouldTrack()) return;
  const deviceId = getOrCreateDeviceId();
  const event = buildShutdownEvent(
    deviceId,
    Date.now() - sessionStartTime,
    Array.from(pagesVisited),
  );
  enqueueEvent(event);
}

export function recordPageVisit(page: string): void {
  pagesVisited.add(page);
}

export function getTelemetryConsent(): TelemetryConsent {
  return getConsent();
}

export function getTelemetryQueueSize(): number {
  return getQueueSize();
}
