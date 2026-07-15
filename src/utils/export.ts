import type { ScanSession } from '../types';
import { getCategoryById } from '../scanner/categories';

export function exportAsJSON(sessions: ScanSession[]) {
  const data = sessions.map((s) => ({
    id: s.id,
    date: s.date,
    cleanedAt: s.cleanedAt,
    totalSize: s.totalSize,
    itemCount: s.itemCount,
    sizeFreed: s.sizeFreed,
    categories: s.categories.map((c) => ({
      name: c.name,
      totalSize: c.totalSize,
      itemCount: c.itemCount,
    })),
  }));

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `cachepilot-history-${formatDateForFile()}.json`);
}

function sanitizeCsvCell(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function exportAsCSV(sessions: ScanSession[]) {
  const rows: string[][] = [
    ['Date', 'Status', 'Total Size (MB)', 'Items', 'Size Freed (MB)', ...sessions[0]?.categories.map((c) => c.name) ?? []],
  ];

  for (const s of sessions) {
    const catSizes = s.categories.map((c) => (c.totalSize / 1024 / 1024).toFixed(2));
    rows.push([
      new Date(s.date).toLocaleString(),
      s.cleanedAt ? 'Cleaned' : 'Scan Only',
      (s.totalSize / 1024 / 1024).toFixed(2),
      String(s.itemCount),
      s.sizeFreed ? (s.sizeFreed / 1024 / 1024).toFixed(2) : '0',
      ...catSizes,
    ]);
  }

  const csv = rows.map((r) => r.map((cell) => `"${sanitizeCsvCell(cell)}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `cachepilot-history-${formatDateForFile()}.csv`);
}

export function exportSessionAsJSON(session: ScanSession) {
  const data = {
    id: session.id,
    date: session.date,
    cleanedAt: session.cleanedAt,
    totalSize: session.totalSize,
    itemCount: session.itemCount,
    sizeFreed: session.sizeFreed,
    categories: session.categories.map((c) => {
      const cat = getCategoryById(c.categoryId);
      return {
        name: c.name,
        totalSize: c.totalSize,
        itemCount: c.itemCount,
        safetyLevel: cat?.safetyLevel ?? 'unknown',
      };
    }),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `cachepilot-scan-${session.id}.json`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatDateForFile(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
