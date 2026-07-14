import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import log from './logger';

const LICENSE_PATH = path.join(app.getPath('userData'), 'license.json');

// ============================================================
// SET THIS TO false WHEN READY TO GO PAID
// ============================================================
const MONETIZATION_DISABLED = true;
// ============================================================

// Replace with your Gumroad product ID (found in Gumroad dashboard > Product > API)
// Enable "Generate a unique license key per sale" in your product settings
const GUMROAD_PRODUCT_ID = '82riz0lK6NA3uLYZ-NnSaQ==';

// Checkout URL — your Gumroad product page
export const GUMROAD_CHECKOUT_URL = 'https://cachepilot.gumroad.com/l/cache-pilot';

// Grace period: re-verify online every 3 days, 14-day offline grace
const RECHECK_EVERY_DAYS = 3;
const OFFLINE_GRACE_DAYS = 14;
const GUMROAD_VERIFY_URL = 'https://api.gumroad.com/v2/licenses/verify';

export interface LicenseStatus {
  tier: 'free' | 'pro';
  isValid: boolean;
  licenseKey?: string;
  activatedAt?: string;
  expiresAt?: string | null;
  deviceName?: string;
}

interface LicenseFileData {
  licenseKey: string;
  email: string;
  lastCheck: number;
  lastValid: number;
  activatedAt: string;
}

function readLicenseFile(): LicenseFileData | null {
  try {
    if (fs.existsSync(LICENSE_PATH)) {
      return JSON.parse(fs.readFileSync(LICENSE_PATH, 'utf-8'));
    }
  } catch (err) {
    log.error('Failed to read license file', err);
  }
  return null;
}

function writeLicenseFile(data: LicenseFileData) {
  try {
    fs.writeFileSync(LICENSE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    log.error('Failed to write license file', err);
  }
}

function clearLicenseFile() {
  try {
    if (fs.existsSync(LICENSE_PATH)) {
      fs.unlinkSync(LICENSE_PATH);
    }
  } catch (err) {
    log.error('Failed to clear license file', err);
  }
}

async function verifyKey(licenseKey: string): Promise<{ valid: boolean; reason?: string; email?: string }> {
  try {
    const res = await fetch(GUMROAD_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey,
        increment_uses_count: 'false',
      }),
    });
    const data = await res.json() as {
      success?: boolean;
      purchase?: {
        email?: string;
        refunded?: boolean;
        disputed?: boolean;
        chargebacked?: boolean;
        subscription_cancelled_at?: string;
        subscription_failed_at?: string;
        subscription_ended_at?: string;
      };
    };

    if (!data.success) {
      return { valid: false, reason: 'invalid-key' };
    }

    const p = data.purchase || {};
    const refunded = !!p.refunded;
    const disputed = !!p.disputed || !!p.chargebacked;
    const subscriptionEnded = !!p.subscription_cancelled_at || !!p.subscription_failed_at || !!p.subscription_ended_at;
    const valid = !refunded && !disputed && !subscriptionEnded;

    let reason: string | undefined;
    if (!valid) {
      reason = refunded ? 'refunded' : disputed ? 'disputed' : 'subscription-ended';
    }

    return { valid, reason, email: p.email };
  } catch (err) {
    log.error('Gumroad verification failed', err);
    return { valid: false, reason: 'network-error' };
  }
}

export async function activateLicense(licenseKey: string): Promise<{ success: boolean; status: LicenseStatus; error?: string }> {
  try {
    const result = await verifyKey(licenseKey.trim());

    if (result.valid) {
      const now = Date.now();
      writeLicenseFile({
        licenseKey: licenseKey.trim(),
        email: result.email || '',
        lastCheck: now,
        lastValid: now,
        activatedAt: new Date(now).toISOString(),
      });
      log.info('License activated', { key: licenseKey.trim().slice(0, 8) + '...' });
      return {
        success: true,
        status: {
          tier: 'pro',
          isValid: true,
          licenseKey: licenseKey.trim(),
          activatedAt: new Date(now).toISOString(),
          deviceName: require('os').hostname(),
        },
      };
    }

    let errorMsg = 'Invalid license key.';
    if (result.reason === 'refunded') errorMsg = 'This license was refunded.';
    else if (result.reason === 'disputed') errorMsg = 'This license was disputed.';
    else if (result.reason === 'subscription-ended') errorMsg = 'This subscription has ended.';
    else if (result.reason === 'network-error') errorMsg = 'Network error. Please check your internet connection.';

    return { success: false, status: { tier: 'free', isValid: false }, error: errorMsg };
  } catch (err) {
    log.error('License activation error', err);
    return {
      success: false,
      status: { tier: 'free', isValid: false },
      error: 'Network error. Please check your internet connection.',
    };
  }
}

export function getLicenseStatus(): LicenseStatus {
  // Everyone gets Pro when monetization is disabled
  if (MONETIZATION_DISABLED) {
    return { tier: 'pro', isValid: true };
  }

  const stored = readLicenseFile();
  if (!stored) {
    return { tier: 'free', isValid: false };
  }

  // Check offline grace
  const daysSinceValid = (Date.now() - stored.lastValid) / 86400000;
  if (daysSinceValid < OFFLINE_GRACE_DAYS) {
    return {
      tier: 'pro',
      isValid: true,
      licenseKey: stored.licenseKey,
      activatedAt: stored.activatedAt,
      deviceName: require('os').hostname(),
    };
  }

  return { tier: 'free', isValid: false };
}

export async function validateAndRefreshLicense(): Promise<LicenseStatus> {
  // Everyone gets Pro when monetization is disabled
  if (MONETIZATION_DISABLED) {
    return { tier: 'pro', isValid: true };
  }

  const stored = readLicenseFile();
  if (!stored) {
    return { tier: 'free', isValid: false };
  }

  const daysSinceCheck = (Date.now() - stored.lastCheck) / 86400000;

  // If checked recently, return cached status
  if (daysSinceCheck < RECHECK_EVERY_DAYS) {
    return {
      tier: 'pro',
      isValid: true,
      licenseKey: stored.licenseKey,
      activatedAt: stored.activatedAt,
      deviceName: require('os').hostname(),
    };
  }

  // Re-verify online
  const result = await verifyKey(stored.licenseKey);

  if (result.valid) {
    const now = Date.now();
    writeLicenseFile({ ...stored, email: result.email || stored.email, lastCheck: now, lastValid: now });
    return {
      tier: 'pro',
      isValid: true,
      licenseKey: stored.licenseKey,
      activatedAt: stored.activatedAt,
      deviceName: require('os').hostname(),
    };
  }

  // Definitive "no longer valid" → revoke locally
  if (['invalid-key', 'refunded', 'disputed', 'subscription-ended'].includes(result.reason || '')) {
    clearLicenseFile();
    return { tier: 'free', isValid: false };
  }

  // Transient (network-error) → fall back to offline grace
  const daysSinceValid = (Date.now() - stored.lastValid) / 86400000;
  if (daysSinceValid < OFFLINE_GRACE_DAYS) {
    return {
      tier: 'pro',
      isValid: true,
      licenseKey: stored.licenseKey,
      activatedAt: stored.activatedAt,
      deviceName: require('os').hostname(),
    };
  }

  return { tier: 'free', isValid: false };
}

export function deactivateLicense(): { success: boolean } {
  try {
    clearLicenseFile();
    log.info('License deactivated');
    return { success: true };
  } catch (err) {
    log.error('Failed to deactivate license', err);
    return { success: false };
  }
}
