import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';

const DEVICE_ID_FILE = 'telemetry-id';

function getDeviceIdPath(): string {
  return path.join(app.getPath('userData'), DEVICE_ID_FILE);
}

export function getOrCreateDeviceId(): string {
  const filePath = getDeviceIdPath();

  try {
    if (fs.existsSync(filePath)) {
      const id = fs.readFileSync(filePath, 'utf-8').trim();
      if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return id;
      }
    }
  } catch {}

  const newId = randomUUID();
  try {
    fs.writeFileSync(filePath, newId, 'utf-8');
  } catch {}

  return newId;
}

export function getDeviceId(): string {
  return getOrCreateDeviceId();
}
