import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import type { TelemetryEvent, QueuedEvent } from './types';
import log from '../main/logger';

const QUEUE_FILE = 'telemetry-queue.json';
const MAX_QUEUE_SIZE = 1000;
const MAX_ATTEMPTS = 5;

function getQueuePath(): string {
  return path.join(app.getPath('userData'), QUEUE_FILE);
}

function readQueue(): QueuedEvent[] {
  const filePath = getQueuePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    log.error('Failed to read telemetry queue', err);
  }
  return [];
}

function writeQueue(queue: QueuedEvent[]): void {
  const filePath = getQueuePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(queue), 'utf-8');
  } catch (err) {
    log.error('Failed to write telemetry queue', err);
  }
}

let nextId = 1;

export function enqueueEvent(event: TelemetryEvent): void {
  const queue = readQueue();

  if (queue.length >= MAX_QUEUE_SIZE) {
    queue.splice(0, queue.length - MAX_QUEUE_SIZE + 1);
  }

  queue.push({
    id: nextId++,
    event,
    attempts: 0,
  });

  writeQueue(queue);
}

export function getQueuedEvents(): QueuedEvent[] {
  return readQueue();
}

export function getQueuedEventBatch(batchSize: number): QueuedEvent[] {
  const queue = readQueue();
  return queue
    .filter((e) => e.attempts < MAX_ATTEMPTS)
    .slice(0, batchSize);
}

export function markEventAttempted(eventIds: number[]): void {
  const queue = readQueue();
  const now = new Date().toISOString();
  for (const item of queue) {
    if (eventIds.includes(item.id)) {
      item.attempts++;
      item.lastAttempt = now;
    }
  }
  writeQueue(queue);
}

export function removeEvents(eventIds: number[]): void {
  const queue = readQueue();
  const idSet = new Set(eventIds);
  const filtered = queue.filter((e) => !idSet.has(e.id));
  writeQueue(filtered);
}

export function removeSuccessfulEvents(eventIds: number[]): void {
  removeEvents(eventIds);
}

export function pruneFailedEvents(): number {
  const queue = readQueue();
  const before = queue.length;
  const filtered = queue.filter((e) => e.attempts < MAX_ATTEMPTS);
  writeQueue(filtered);
  return before - filtered.length;
}

export function getQueueSize(): number {
  return readQueue().length;
}

export function clearQueue(): void {
  writeQueue([]);
}
