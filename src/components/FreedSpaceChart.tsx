import { formatSize } from '../store';
import { Trash2, TrendingDown } from 'lucide-react';

interface FreedSpaceChartProps {
  beforeSize: number;
  afterSize: number;
  freedSize: number;
}

export function FreedSpaceChart({ beforeSize, afterSize, freedSize }: FreedSpaceChartProps) {
  if (beforeSize === 0) return null;

  const maxBarWidth = 100;
  const afterPercent = beforeSize > 0 ? (afterSize / beforeSize) * 100 : 0;
  const freedPercent = beforeSize > 0 ? (freedSize / beforeSize) * 100 : 0;

  return (
    <div className="card-elevated" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(56, 210, 122, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingDown style={{ width: 16, height: 16, color: 'rgb(56, 210, 122)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
              Space Freed
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Trash2 style={{ width: 14, height: 14, color: 'rgb(56, 210, 122)' }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'rgb(56, 210, 122)' }}>
              {formatSize(freedSize)}
            </span>
          </div>
        </div>

        {/* Before bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>Before cleanup</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)' }}>
              {formatSize(beforeSize)}
            </span>
          </div>
          <div
            style={{
              height: 24,
              borderRadius: 6,
              background: 'rgb(26, 32, 40)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${maxBarWidth}%`,
                borderRadius: 6,
                background: 'linear-gradient(90deg, rgba(77, 163, 255, 0.4), rgba(77, 163, 255, 0.2))',
                border: '1px solid rgba(77, 163, 255, 0.15)',
              }}
            />
          </div>
        </div>

        {/* After bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>After cleanup</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgb(169, 180, 194)' }}>
              {formatSize(afterSize)}
            </span>
          </div>
          <div
            style={{
              height: 24,
              borderRadius: 6,
              background: 'rgb(26, 32, 40)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${afterPercent}%`,
                borderRadius: 6,
                background: 'linear-gradient(90deg, rgba(56, 210, 122, 0.5), rgba(56, 210, 122, 0.3))',
                border: '1px solid rgba(56, 210, 122, 0.2)',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
        </div>

        {/* Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(56, 210, 122, 0.06)',
            border: '1px solid rgba(56, 210, 122, 0.12)',
          }}
        >
          <span style={{ fontSize: 13, color: 'rgb(169, 180, 194)' }}>
            Freed <strong style={{ color: 'rgb(56, 210, 122)' }}>{formatSize(freedSize)}</strong> of cache
          </span>
          <span style={{ fontSize: 12, color: 'rgb(85, 96, 110)' }}>·</span>
          <span style={{ fontSize: 13, color: 'rgb(169, 180, 194)' }}>
            <strong style={{ color: 'rgb(56, 210, 122)' }}>{freedPercent.toFixed(1)}%</strong> reduction
          </span>
        </div>
      </div>
    </div>
  );
}
