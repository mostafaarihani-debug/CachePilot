import { generateId } from './database';
import type { ScanSession, CleanupAction, HistoryEvent } from '../types';

const STORAGE_KEY = 'cachepilot_scans';
const HISTORY_KEY = 'cachepilot_history';

function getStoredScans(): ScanSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function storeScans(scans: ScanSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
}

function getStoredHistory(): HistoryEvent[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function storeHistory(events: HistoryEvent[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(events));
}

export function saveScanSession(session: ScanSession): void {
  const scans = getStoredScans();
  scans.unshift(session);
  if (scans.length > 50) scans.pop();
  storeScans(scans);
}

export function getLatestScan(): ScanSession | null {
  const scans = getStoredScans();
  return scans.length > 0 ? scans[0] : null;
}

export function getScanHistory(limit: number = 50): ScanSession[] {
  return getStoredScans().slice(0, limit);
}

export function saveCleanupAction(_action: CleanupAction): void {
  addHistoryEvent('cleanup', `Cleaned ${_action.itemsCleaned} items, freed ${_action.sizeFreed} bytes`);
}

export function getCleanupHistory(): CleanupAction[] {
  return [];
}

export function getSettings(): Record<string, string> {
  try {
    const data = localStorage.getItem('cachepilot_settings');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveSetting(key: string, value: string): void {
  const settings = getSettings();
  settings[key] = value;
  localStorage.setItem('cachepilot_settings', JSON.stringify(settings));
}

export function addHistoryEvent(type: HistoryEvent['type'], details: string, metadata?: string): void {
  const events = getStoredHistory();
  events.unshift({
    id: generateId(),
    type,
    date: new Date().toISOString(),
    details,
    metadata,
  });
  if (events.length > 100) events.pop();
  storeHistory(events);
}

export function getHistoryEvents(limit: number = 100): HistoryEvent[] {
  return getStoredHistory().slice(0, limit);
}

export function updateScanSession(id: string, updates: Partial<ScanSession>): void {
  const scans = getStoredScans();
  const idx = scans.findIndex((s) => s.id === id);
  if (idx !== -1) {
    scans[idx] = { ...scans[idx], ...updates };
    storeScans(scans);
  }
}

export function deleteScanSession(id: string): void {
  const scans = getStoredScans();
  storeScans(scans.filter((s) => s.id !== id));
}