import { useState, useEffect, useRef } from 'react';
import { useAppStore, formatSize } from '../store';
import { recalcLifetimeStats, type LifetimeStats } from '../utils/lifetimeStats';
import {
  BarChart3,
  ScanSearch,
  Trash2,
  FileX,
  HardDrive,
  TrendingUp,
} from 'lucide-react';

interface StatCardProps {
  icon: typeof BarChart3;
  label: string;
  value: string;
  color: string;
  bg: string;
  prevValue?: string;
}

function StatCard({ icon: Icon, label, value, color, bg, prevValue }: StatCardProps) {
  const [flash, setFlash] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (prevValue !== undefined && prevValue !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [value, prevValue]);

  return (
    <div
      style={{
        padding: '14px 16px',
        borderRadius: 12,
        background: flash ? `${color}15` : bg,
        border: `1px solid ${flash ? `${color}44` : `${color}22`}`,
        transition: 'all 0.3s ease',
        transform: flash ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon style={{ width: 14, height: 14, color }} />
        <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)', fontWeight: 500 }}>{label}</span>
      </div>
      <p style={{ fontSize: 18, fontWeight: 700, color: 'rgb(232, 237, 245)', margin: 0, transition: 'color 0.3s' }}>
        {value}
      </p>
    </div>
  );
}

export function LifetimeStatsCard() {
  const scanHistory = useAppStore((s) => s.scanHistory);
  const latestScan = useAppStore((s) => s.latestScan);

  const [stats, setStats] = useState<LifetimeStats>(() => recalcLifetimeStats(scanHistory));
  const prevStatsRef = useRef<LifetimeStats>(stats);

  useEffect(() => {
    const recalculated = recalcLifetimeStats(scanHistory);
    prevStatsRef.current = stats;
    setStats(recalculated);
  }, [scanHistory, latestScan]);

  const prev = prevStatsRef.current;

  return (
    <div className="card-elevated" style={{ overflow: 'hidden' }}>
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(77, 163, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 style={{ width: 16, height: 16, color: 'rgb(77, 163, 255)' }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
              Lifetime Statistics
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'rgb(85, 96, 110)' }}>
            {scanHistory.length} scan{scanHistory.length !== 1 ? 's' : ''} in history
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <StatCard
            icon={ScanSearch}
            label="Total Scans"
            value={String(stats.totalScans)}
            prevValue={String(prev.totalScans)}
            color="rgb(77, 163, 255)"
            bg="rgba(77, 163, 255, 0.06)"
          />
          <StatCard
            icon={Trash2}
            label="Total Cleanups"
            value={String(stats.totalCleanups)}
            prevValue={String(prev.totalCleanups)}
            color="rgb(56, 210, 122)"
            bg="rgba(56, 210, 122, 0.06)"
          />
          <StatCard
            icon={FileX}
            label="Files Removed"
            value={stats.totalFilesRemoved > 0 ? stats.totalFilesRemoved.toLocaleString() : '0'}
            prevValue={prev.totalFilesRemoved > 0 ? prev.totalFilesRemoved.toLocaleString() : '0'}
            color="rgb(168, 130, 255)"
            bg="rgba(168, 130, 255, 0.06)"
          />
          <StatCard
            icon={HardDrive}
            label="Space Freed"
            value={stats.totalSpaceFreed > 0 ? formatSize(stats.totalSpaceFreed) : '0 B'}
            prevValue={prev.totalSpaceFreed > 0 ? formatSize(prev.totalSpaceFreed) : '0 B'}
            color="rgb(39, 211, 181)"
            bg="rgba(39, 211, 181, 0.06)"
          />
          <StatCard
            icon={TrendingUp}
            label="Largest Cleanup"
            value={stats.largestCleanup > 0 ? formatSize(stats.largestCleanup) : '0 B'}
            prevValue={prev.largestCleanup > 0 ? formatSize(prev.largestCleanup) : '0 B'}
            color="rgb(245, 184, 74)"
            bg="rgba(245, 184, 74, 0.06)"
          />
          <StatCard
            icon={BarChart3}
            label="Avg Cleanup"
            value={stats.averageCleanupSize > 0 ? formatSize(stats.averageCleanupSize) : '0 B'}
            prevValue={prev.averageCleanupSize > 0 ? formatSize(prev.averageCleanupSize) : '0 B'}
            color="rgb(116, 130, 148)"
            bg="rgba(116, 130, 148, 0.06)"
          />
        </div>
      </div>
    </div>
  );
}
