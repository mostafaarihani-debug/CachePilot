import { useAppStore, formatSize } from '../store';
import { cacheCategories } from '../scanner/categories';
import { getCategoryIcon } from '../utils/iconMap';

export function ScanProgress() {
  const { scanProgress, isScanning } = useAppStore();

  if (!isScanning || scanProgress.length === 0) return null;

  const totalCategories = cacheCategories.length;
  const doneCount = scanProgress.filter((p) => p.status === 'done').length;
  const percent = Math.round((doneCount / totalCategories) * 100);

  return (
    <div
      className="card-elevated"
      style={{ overflow: 'hidden' }}
    >
      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(77, 163, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: '2px solid rgba(77, 163, 255, 0.3)',
                  borderTopColor: 'rgb(77, 163, 255)',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)', margin: 0 }}>
                Scanning your PC...
              </p>
              <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', margin: 0, marginTop: 2 }}>
                {doneCount} of {totalCategories} categories checked
              </p>
            </div>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'rgb(77, 163, 255)' }}>
            {percent}%
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: 'rgb(26, 32, 40)',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              borderRadius: 3,
              background: 'linear-gradient(90deg, rgb(77, 163, 255), rgb(39, 211, 181))',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {scanProgress.map((p) => {
            const cat = cacheCategories.find((c) => c.id === p.categoryId);
            const Icon = getCategoryIcon(cat?.icon || 'Globe');
            const isDone = p.status === 'done';
            const isCurrent = p.status === 'scanning';

            return (
              <div
                key={p.categoryId}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: isCurrent
                    ? 'rgba(77, 163, 255, 0.08)'
                    : isDone
                    ? 'rgba(56, 210, 122, 0.05)'
                    : 'rgb(26, 32, 40)',
                  border: `1px solid ${
                    isCurrent
                      ? 'rgba(77, 163, 255, 0.25)'
                      : isDone
                      ? 'rgba(56, 210, 122, 0.15)'
                      : 'rgb(43, 52, 65)'
                  }`,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Icon
                    style={{
                      width: 14,
                      height: 14,
                      color: isCurrent
                        ? 'rgb(77, 163, 255)'
                        : isDone
                        ? 'rgb(56, 210, 122)'
                        : 'rgb(116, 130, 148)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: isCurrent
                        ? 'rgb(232, 237, 245)'
                        : isDone
                        ? 'rgb(169, 180, 194)'
                        : 'rgb(116, 130, 148)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {p.categoryName}
                  </span>
                </div>
                {isDone && p.itemCount != null && p.itemCount > 0 && (
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgb(116, 130, 148)',
                      margin: 0,
                      marginTop: 4,
                      marginLeft: 22,
                    }}
                  >
                    {formatSize(p.totalSize ?? 0)} · {p.itemCount} items
                  </p>
                )}
                {isDone && (p.itemCount == null || p.itemCount === 0) && (
                  <p
                    style={{
                      fontSize: 11,
                      color: 'rgb(116, 130, 148)',
                      margin: 0,
                      marginTop: 4,
                      marginLeft: 22,
                      opacity: 0.6,
                    }}
                  >
                    Clean
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
