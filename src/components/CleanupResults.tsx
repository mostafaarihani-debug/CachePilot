import { useState } from 'react';
import { CheckCircle2, AlertCircle, XCircle, ArrowLeft, ChevronDown, ChevronRight, Info } from 'lucide-react';
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

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: report.allSucceeded ? 'rgba(56, 210, 122, 0.1)' : 'rgba(245, 184, 74, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {report.allSucceeded ? (
            <CheckCircle2 style={{ width: 32, height: 32, color: '#38D27A' }} />
          ) : (
            <AlertCircle style={{ width: 32, height: 32, color: '#F5B84A' }} />
          )}
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'rgb(232, 237, 245)', margin: 0 }}>
          Cleanup Complete
        </h2>
        <p style={{ fontSize: 14, color: 'rgb(169, 180, 194)', marginTop: 8 }}>
          {report.totalItemsCleaned} items cleaned, {formatSize(report.totalSizeFreed)} freed
        </p>
        {!report.allSucceeded && (
          <p style={{ fontSize: 13, color: 'rgb(169, 180, 194)', marginTop: 4 }}>
            Some files were in use by Windows and could not be deleted. They will be cleaned on next restart.
          </p>
        )}
      </div>

      <FreedSpaceChart
        beforeSize={beforeSize}
        afterSize={beforeSize - report.totalSizeFreed}
        freedSize={report.totalSizeFreed}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 24, marginBottom: 24 }}>
        {report.results.filter(r => r.status === 'success').map((result) => (
          <div
            key={result.categoryId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderRadius: 10,
              background: 'rgb(26, 32, 40)',
              border: '1px solid rgba(56, 210, 122, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 style={{ width: 16, height: 16, color: '#38D27A', flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                {result.categoryName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
              <span style={{ fontSize: 13, color: 'rgb(130, 140, 155)' }}>
                {result.itemsCleaned} items
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'rgb(169, 180, 194)', minWidth: 60, textAlign: 'right' }}>
                {formatSize(result.sizeFreed)}
              </span>
            </div>
          </div>
        ))}

        {report.results.filter(r => r.status !== 'success').map((result) => (
          <div
            key={result.categoryId}
            style={{
              borderRadius: 10,
              background: 'rgb(26, 32, 40)',
              border: `1px solid ${
                result.status === 'partial' ? 'rgba(245, 184, 74, 0.2)' : 'rgba(255, 107, 107, 0.2)'
              }`,
              overflow: 'hidden',
            }}
          >
            <div
              onClick={() => result.errors.length > 0 && toggleExpand(result.categoryId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                cursor: result.errors.length > 0 ? 'pointer' : 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {result.status === 'partial' ? (
                  <AlertCircle style={{ width: 16, height: 16, color: '#F5B84A', flexShrink: 0 }} />
                ) : (
                  <XCircle style={{ width: 16, height: 16, color: '#FF6B6B', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 14, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                  {result.categoryName}
                </span>
                {result.itemsCleaned > 0 && (
                  <span style={{ fontSize: 12, color: '#38D27A', background: 'rgba(56, 210, 122, 0.1)', padding: '2px 8px', borderRadius: 6 }}>
                    {result.itemsCleaned} cleaned
                  </span>
                )}
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
              <div style={{ padding: '8px 16px 12px 42px', borderTop: '1px solid rgba(43, 52, 65, 0.5)' }}>
                <p style={{ fontSize: 13, color: 'rgb(169, 180, 194)', margin: 0, lineHeight: 1.5 }}>
                  {friendlyError(result.errors[0])}
                </p>
                {result.errors.length > 1 && (
                  <p style={{ fontSize: 12, color: 'rgb(110, 120, 135)', margin: '4px 0 0', lineHeight: 1.4 }}>
                    +{result.errors.length - 1} more files could not be removed
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: '1px solid rgb(43, 52, 65)',
            borderRadius: 8,
            padding: '10px 20px',
            color: 'rgb(169, 180, 194)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          Back to Scan Results
        </button>
      </div>
    </div>
  );
}
