import { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, ArrowLeft, ChevronDown, ChevronRight, Info, Sparkles } from 'lucide-react';
import type { CleanupReport } from '../scanner/cleanup';
import { formatSize } from '../store';
import { FreedSpaceChart } from './FreedSpaceChart';

interface CleanupResultsProps {
  report: CleanupReport;
  beforeSize: number;
  onBack: () => void;
}

function friendlyError(raw: string): string {
  if (raw.includes('EBUSY') || raw.includes('resource busy')) {
    return 'Some files are in use by another program and could not be removed';
  }
  if (raw.includes('EPERM') || raw.includes('permission')) {
    return 'Some files are protected by the system and could not be removed';
  }
  if (raw.includes('ENOENT')) {
    return 'Some files were already removed';
  }
  return 'Some files could not be removed';
}

export function CleanupResults({ report, beforeSize, onBack }: CleanupResultsProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedErrors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const successResults = report.results.filter(r => r.status === 'success');
  const partialResults = report.results.filter(r => r.status === 'partial');
  const failedResults = report.results.filter(r => r.status === 'failed');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: report.allSucceeded
              ? 'linear-gradient(135deg, rgba(56, 210, 122, 0.15), rgba(56, 210, 122, 0.05))'
              : 'linear-gradient(135deg, rgba(245, 184, 74, 0.15), rgba(245, 184, 74, 0.05))',
            border: `1px solid ${report.allSucceeded ? 'rgba(56, 210, 122, 0.2)' : 'rgba(245, 184, 74, 0.2)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          {report.allSucceeded ? (
            <CheckCircle2 style={{ width: 36, height: 36, color: '#38D27A' }} />
          ) : (
            <AlertCircle style={{ width: 36, height: 36, color: '#F5B84A' }} />
          )}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: 'rgb(232, 237, 245)', margin: 0, letterSpacing: '-0.01em' }}>
          Cleanup Complete
        </h2>
        <p style={{ fontSize: 15, color: 'rgb(130, 140, 155)', marginTop: 10, lineHeight: 1.5 }}>
          {report.totalItemsCleaned.toLocaleString()} items cleaned · {formatSize(report.totalSizeFreed)} freed
        </p>
        {!report.allSucceeded && (
          <p style={{ fontSize: 13, color: 'rgb(130, 140, 155)', marginTop: 6 }}>
            Some files were in use by Windows and could not be deleted. They will be cleaned on next restart.
          </p>
        )}
      </div>

      {/* Space Freed Chart */}
      <FreedSpaceChart
        beforeSize={beforeSize}
        afterSize={beforeSize - report.totalSizeFreed}
        freedSize={report.totalSizeFreed}
      />

      {/* Results Summary */}
      {successResults.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(56, 210, 122)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(130, 140, 155)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Successfully Cleaned
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {successResults.map((result) => (
              <div
                key={result.categoryId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgb(21, 26, 33)',
                  border: '1px solid rgba(56, 210, 122, 0.12)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: 'rgba(56, 210, 122, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14, color: '#38D27A' }} />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                    {result.categoryName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>
                    {result.itemsCleaned.toLocaleString()} items
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(169, 180, 194)', minWidth: 70, textAlign: 'right' }}>
                    {formatSize(result.sizeFreed)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partial / Failed */}
      {[...partialResults, ...failedResults].length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgb(245, 184, 74)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(130, 140, 155)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Needs Attention
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...partialResults, ...failedResults].map((result) => (
              <div
                key={result.categoryId}
                style={{
                  borderRadius: 12,
                  background: 'rgb(21, 26, 33)',
                  border: `1px solid ${result.status === 'partial' ? 'rgba(245, 184, 74, 0.15)' : 'rgba(255, 107, 107, 0.15)'}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  onClick={() => result.errors.length > 0 && toggleExpand(result.categoryId)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    cursor: result.errors.length > 0 ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: result.status === 'partial' ? 'rgba(245, 184, 74, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {result.status === 'partial' ? (
                        <AlertCircle style={{ width: 14, height: 14, color: '#F5B84A' }} />
                      ) : (
                        <XCircle style={{ width: 14, height: 14, color: '#FF6B6B' }} />
                      )}
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                        {result.categoryName}
                      </span>
                      {result.itemsCleaned > 0 && (
                        <span style={{ fontSize: 12, color: '#38D27A', background: 'rgba(56, 210, 122, 0.1)', padding: '2px 8px', borderRadius: 6, marginLeft: 8 }}>
                          {result.itemsCleaned} cleaned
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {result.sizeFreed > 0 && (
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(169, 180, 194)' }}>
                        {formatSize(result.sizeFreed)}
                      </span>
                    )}
                    {result.errors.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgb(130, 140, 155)' }}>
                        <Info style={{ width: 14, height: 14 }} />
                        {expandedErrors.has(result.categoryId) ? (
                          <ChevronDown style={{ width: 14, height: 14 }} />
                        ) : (
                          <ChevronRight style={{ width: 14, height: 14 }} />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {expandedErrors.has(result.categoryId) && result.errors.length > 0 && (
                  <div style={{ padding: '10px 16px 14px 56px', borderTop: '1px solid rgba(43, 52, 65, 0.4)' }}>
                    <p style={{ fontSize: 13, color: 'rgb(169, 180, 194)', margin: 0, lineHeight: 1.5 }}>
                      {friendlyError(result.errors[0])}
                    </p>
                    {result.errors.length > 1 && (
                      <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', margin: '4px 0 0', lineHeight: 1.4 }}>
                        +{result.errors.length - 1} more files could not be removed
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 36 }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'linear-gradient(135deg, rgb(77, 163, 255), rgb(168, 130, 255))',
            border: 'none',
            borderRadius: 12,
            padding: '12px 24px',
            color: 'white',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(77, 163, 255, 0.25)',
            transition: 'all 0.2s',
          }}
        >
          <Sparkles style={{ width: 16, height: 16 }} />
          Scan Again
        </button>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: '1px solid rgb(43, 52, 65)',
            borderRadius: 12,
            padding: '12px 24px',
            color: 'rgb(169, 180, 194)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back to Results
        </button>
      </div>
    </div>
  );
}
