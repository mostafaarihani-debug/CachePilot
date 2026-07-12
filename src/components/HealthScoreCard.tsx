import { useMemo } from 'react';
import { useAppStore } from '../store';
import { calculateHealthScore } from '../utils/healthScore';
import { Activity } from 'lucide-react';

export function HealthScoreCard() {
  const { latestScan, scanHistory } = useAppStore();

  const health = useMemo(
    () => calculateHealthScore(latestScan, scanHistory),
    [latestScan, scanHistory]
  );

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (health.score / 100) * circumference;

  const scoreColor =
    health.score >= 85
      ? 'rgb(56, 210, 122)'
      : health.score >= 65
      ? 'rgb(245, 184, 74)'
      : 'rgb(255, 107, 107)';

  const labelColor =
    health.score >= 85
      ? 'text-success'
      : health.score >= 65
      ? 'text-warning'
      : 'text-danger';

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
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
            <Activity style={{ width: 16, height: 16, color: 'rgb(56, 210, 122)' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
            PC Health
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="rgb(26, 32, 40)"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={scoreColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
                {health.score}
              </span>
              <span style={{ fontSize: 10, color: 'rgb(116, 130, 148)', marginTop: 2 }}>%</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <p className={labelColor} style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              {health.label}
            </p>
            <p style={{ fontSize: 12, color: 'rgb(169, 180, 194)', margin: 0, marginTop: 4, lineHeight: 1.5 }}>
              {health.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
