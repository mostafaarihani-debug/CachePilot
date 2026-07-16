import { useAppStore, formatSize, formatDate } from '../store';
import { getCategoryById } from '../scanner/categories';
import {
  History as HistoryIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Sparkles,
  ScanSearch,
  ArrowUp,
  ArrowDown,
  Minus,
  GitCompareArrows,
  Download,
} from 'lucide-react';
import { CategoryIcon } from '../components/CategoryIcon';
import { exportAsJSON, exportAsCSV } from '../utils/export';

export function History() {
  const { scanHistory } = useAppStore();

  const totalScans = scanHistory.length;
  const cleanedSessions = scanHistory.filter((s) => s.cleanedAt);
  const totalFreed = cleanedSessions.reduce((sum, s) => sum + (s.sizeFreed ?? 0), 0);

  const lastTwoScans = scanHistory.length >= 2 ? [scanHistory[0], scanHistory[1]] : null;
  const comparison = lastTwoScans ? (() => {
    const [newer, older] = lastTwoScans;
    const sizeDiff = (newer.totalSize ?? 0) - (older.totalSize ?? 0);
    const itemDiff = (newer.itemCount ?? 0) - (older.itemCount ?? 0);
    const catDiffs = (newer.categories ?? []).map((newCat) => {
      const oldCat = (older.categories ?? []).find((c) => c.categoryId === newCat.categoryId);
      return {
        categoryId: newCat.categoryId,
        name: newCat.name,
        oldSize: oldCat?.totalSize ?? 0,
        newSize: newCat.totalSize ?? 0,
        diff: (newCat.totalSize ?? 0) - (oldCat?.totalSize ?? 0),
        oldCount: oldCat?.itemCount ?? 0,
        newCount: newCat.itemCount ?? 0,
        countDiff: (newCat.itemCount ?? 0) - (oldCat?.itemCount ?? 0),
      };
    }).filter((d) => d.diff !== 0).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
    return { sizeDiff, itemDiff, catDiffs, newer, older };
  })() : null;

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'rgb(15, 17, 21)' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(168, 130, 255, 0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(43, 52, 65, 0.5)',
        }}
      >
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(168, 130, 255, 0.15), rgba(168, 130, 255, 0.05))',
                border: '1px solid rgba(168, 130, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HistoryIcon className="w-5 h-5" style={{ color: 'rgb(168, 130, 255)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(232, 237, 245)' }}>History</h1>
              <p style={{ fontSize: 13, color: 'rgb(116, 130, 148)', marginTop: 2 }}>View your previous scans and cleanup actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">

        {scanHistory.length > 0 ? (
          <>
            {/* Comparison Banner */}
            {comparison && comparison.catDiffs.length > 0 && (
              <div
                className="p-5"
                style={{
                  background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(26, 32, 40) 100%)',
                  border: '1px solid rgb(43, 52, 65)',
                  borderRadius: 16,
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(168, 130, 255, 0.1)',
                    }}
                  >
                    <GitCompareArrows className="w-5 h-5" style={{ color: 'rgb(168, 130, 255)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-txt">Scan Comparison</p>
                    <p className="text-xs text-txt-muted">
                      Compared to previous scan ({formatDate(comparison.older.date)})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-surface">
                    <p className="text-xs text-txt-muted mb-1">Total Size Change</p>
                    <div className="flex items-center gap-1.5">
                      {comparison.sizeDiff > 0 ? (
                        <ArrowUp className="w-3.5 h-3.5 text-red-400" />
                      ) : comparison.sizeDiff < 0 ? (
                        <ArrowDown className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-txt-muted" />
                      )}
                      <span className={`text-sm font-semibold ${comparison.sizeDiff > 0 ? 'text-red-400' : comparison.sizeDiff < 0 ? 'text-green-400' : 'text-txt-muted'}`}>
                        {comparison.sizeDiff === 0 ? 'No change' : `${comparison.sizeDiff > 0 ? '+' : ''}${formatSize(comparison.sizeDiff)}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface">
                    <p className="text-xs text-txt-muted mb-1">Items Change</p>
                    <div className="flex items-center gap-1.5">
                      {comparison.itemDiff > 0 ? (
                        <ArrowUp className="w-3.5 h-3.5 text-red-400" />
                      ) : comparison.itemDiff < 0 ? (
                        <ArrowDown className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-txt-muted" />
                      )}
                      <span className={`text-sm font-semibold ${comparison.itemDiff > 0 ? 'text-red-400' : comparison.itemDiff < 0 ? 'text-green-400' : 'text-txt-muted'}`}>
                        {comparison.itemDiff === 0 ? 'No change' : `${comparison.itemDiff > 0 ? '+' : ''}${comparison.itemDiff}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface">
                    <p className="text-xs text-txt-muted mb-1">Changed Categories</p>
                    <span className="text-sm font-semibold text-txt">{comparison.catDiffs.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {comparison.catDiffs.slice(0, 5).map((diff) => {
                    const category = getCategoryById(diff.categoryId);
                    return (
                      <div key={diff.categoryId} className="flex items-center justify-between p-2 rounded-lg bg-surface/50">
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconName={category?.icon || 'Globe'} size={14} color="rgb(116, 130, 148)" />
                          <span className="text-xs text-txt-secondary">{diff.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-txt-muted">{formatSize(diff.oldSize)}</span>
                          <span className="text-xs text-txt-muted">→</span>
                          <span className="text-xs text-txt font-medium">{formatSize(diff.newSize)}</span>
                          <span className={`text-xs font-medium ${diff.diff > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {diff.diff > 0 ? '+' : ''}{formatSize(diff.diff)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary Banner */}
            <div
              className="flex items-center gap-6 p-5"
              style={{
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(26, 32, 40) 100%)',
                border: '1px solid rgb(43, 52, 65)',
                borderRadius: 16,
              }}
            >
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(77, 163, 255, 0.05))',
                  border: '1px solid rgba(77, 163, 255, 0.2)',
                }}
              >
                <ScanSearch className="w-6 h-6" style={{ color: 'rgb(77, 163, 255)' }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 13, color: 'rgb(116, 130, 148)', marginBottom: 2 }}>
                  {totalScans} scan{totalScans !== 1 ? 's' : ''} completed
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
                  {cleanedSessions.length > 0
                    ? `You've freed ${formatSize(totalFreed)} across ${cleanedSessions.length} cleanup${cleanedSessions.length !== 1 ? 's' : ''}`
                    : 'Run a cleanup to start freeing space'}
                </p>
              </div>
              {totalFreed > 0 && (
                <div
                  className="flex items-center gap-2 shrink-0"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 12,
                    background: 'rgba(56, 210, 122, 0.1)',
                    border: '1px solid rgba(56, 210, 122, 0.25)',
                  }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: 'rgb(56, 210, 122)' }} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'rgb(56, 210, 122)' }}>
                    {formatSize(totalFreed)}
                  </span>
                  <span style={{ fontSize: 12, color: 'rgba(56, 210, 122, 0.7)' }}>freed</span>
                </div>
              )}
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => exportAsJSON(scanHistory)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(43, 52, 65, 0.8)',
                  background: 'rgb(21, 26, 33)',
                  color: 'rgb(168, 179, 194)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={() => exportAsCSV(scanHistory)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(43, 52, 65, 0.8)',
                  background: 'rgb(21, 26, 33)',
                  color: 'rgb(168, 179, 194)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            {/* Session Cards */}
            <div className="space-y-3">
              {scanHistory.map((scan) => {
                const isCleaned = !!scan.cleanedAt;

                return (
                  <div
                    key={scan.id}
                    className="card"
                    style={{
                      borderLeft: isCleaned
                        ? '3px solid rgb(56, 210, 122)'
                        : '3px solid rgb(43, 52, 65)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: isCleaned
                              ? 'rgba(56, 210, 122, 0.1)'
                              : 'rgba(77, 163, 255, 0.1)',
                          }}
                        >
                          {isCleaned ? (
                            <CheckCircle2 className="w-5 h-5" style={{ color: 'rgb(56, 210, 122)' }} />
                          ) : (
                            <Clock className="w-5 h-5" style={{ color: 'rgb(77, 163, 255)' }} />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-txt">
                              {isCleaned ? 'Cleaned' : 'Scan completed'}
                            </p>
                            {isCleaned && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  color: 'rgb(56, 210, 122)',
                                  background: 'rgba(56, 210, 122, 0.12)',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                }}
                              >
                                Cleaned
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-txt-muted">
                            {formatDate(isCleaned ? scan.cleanedAt! : scan.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="text-right">
                          <p className="text-sm font-medium text-txt">
                            {formatSize(scan.totalSize)}
                          </p>
                          <p className="text-xs text-txt-muted">
                            {scan.itemCount} items
                          </p>
                        </div>

                        {isCleaned && scan.sizeFreed != null && scan.sizeFreed > 0 && (
                          <div
                            className="flex items-center gap-1.5 shrink-0"
                            style={{
                              padding: '4px 12px',
                              borderRadius: 8,
                              background: 'rgba(56, 210, 122, 0.1)',
                              border: '1px solid rgba(56, 210, 122, 0.2)',
                            }}
                          >
                            <Sparkles className="w-3.5 h-3.5" style={{ color: 'rgb(56, 210, 122)' }} />
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'rgb(56, 210, 122)',
                              }}
                            >
                              {formatSize(scan.sizeFreed)} freed
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {scan.categories.filter((c) => c.safetyLevel === 'safe').length > 0 && (
                            <span className="badge badge-safe">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              {scan.categories.filter((c) => c.safetyLevel === 'safe').length} safe
                            </span>
                          )}
                          {scan.categories.filter((c) => c.safetyLevel === 'caution').length > 0 && (
                            <span className="badge badge-caution">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              {scan.categories.filter((c) => c.safetyLevel === 'caution').length} caution
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-bdr">
                      <div className="flex flex-wrap gap-2">
                        {scan.categories.map((cat) => {
                          const category = getCategoryById(cat.categoryId);
                          return (
                            <span
                              key={cat.categoryId}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface text-xs text-txt-secondary"
                            >
                              <CategoryIcon
                                iconName={category?.icon || 'Globe'}
                                size={12}
                                color="rgb(116, 130, 148)"
                              />
                              {cat.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="card-elevated text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-txt mb-2">No history yet</h3>
            <p className="text-txt-secondary max-w-md mx-auto">
              Your scan history will appear here. Run your first scan to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
