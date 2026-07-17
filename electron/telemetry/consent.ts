import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import type { TelemetryConsent } from './types';

const CONSENT_FILE = 'telemetry-consent';

function getConsentPath(): string {
  return path.join(app.getPath('userData'), CONSENT_FILE);
}

export function getConsent(): TelemetryConsent {
  const filePath = getConsentPath();
  try {
    if (fs.existsSync(filePath)) {
      const value = fs.readFileSync(filePath, 'utf-8').trim();
      if (value === 'yes' || value === 'no') return value;
    }
  } catch {}
  return 'unset';
}

export function setConsent(consent: TelemetryConsent): void {
  const filePath = getConsentPath();
  try {
    fs.writeFileSync(filePath, consent, 'utf-8');
  } catch {}
}

export function hasConsent(): boolean {
  return getConsent() === 'yes';
}

export function isConsentDecided(): boolean {
  return getConsent() !== 'unset';
}
