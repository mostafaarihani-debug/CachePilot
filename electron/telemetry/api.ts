import type { TelemetryEvent } from './types';
import log from '../main/logger';

const API_BASE_URL = 'https://cachepilot-api.admorandom.workers.dev';
const BATCH_SIZE = 50;
const REQUEST_TIMEOUT = 10000;

async function postJson(path: string, body: unknown): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return response.ok;
  } catch (err) {
    log.debug('Telemetry API request failed', { path, error: String(err) });
    return false;
  }
}

export async function sendEvents(events: TelemetryEvent[]): Promise<boolean> {
  if (events.length === 0) return true;
  if (events.length === 1) {
    return postJson('/api/v1/events', { events });
  }
  return postJson('/api/v1/events', { events });
}

export async function sendEvent(event: TelemetryEvent): Promise<boolean> {
  return sendEvents([event]);
}

export async function sendCrashReport(event: TelemetryEvent): Promise<boolean> {
  return postJson('/api/v1/crash', event);
}

export async function sendBatch(events: TelemetryEvent[]): Promise<{ accepted: number; failed: number }> {
  let accepted = 0;
  let failed = 0;

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    const ok = await sendEvents(batch);
    if (ok) {
      accepted += batch.length;
    } else {
      failed += batch.length;
    }
  }

  return { accepted, failed };
}

export { API_BASE_URL };
