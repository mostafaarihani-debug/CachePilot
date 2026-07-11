interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export function Skeleton({ width, height = 16, borderRadius = 6, className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-surface-2 ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card" style={{ opacity: 0.6 }}>
      <div className="flex items-start gap-4">
        <Skeleton width={40} height={40} borderRadius={10} />
        <div className="flex-1 space-y-3">
          <Skeleton width="40%" height={18} />
          <Skeleton width="70%" height={14} />
          <div className="space-y-2 mt-4">
            <Skeleton width="100%" height={36} borderRadius={8} />
            <Skeleton width="100%" height={36} borderRadius={8} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Skeleton width={200} height={32} />
          <Skeleton width={280} height={14} className="mt-2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Skeleton width={160} height={32} />
          <Skeleton width={300} height={14} className="mt-2" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Skeleton width={180} height={32} />
          <Skeleton width={320} height={14} className="mt-2" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
