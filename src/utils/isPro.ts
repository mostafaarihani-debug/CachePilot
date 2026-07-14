import type { LicenseStatus } from '../types';

export function isPro(status: LicenseStatus | null | undefined): boolean {
  return status?.tier === 'pro' && status?.isValid === true;
}
