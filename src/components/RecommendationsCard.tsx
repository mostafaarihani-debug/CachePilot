import { useMemo } from 'react';
import { useAppStore } from '../store';
import { generateRecommendations, type Recommendation } from '../utils/recommendations';
import { Lightbulb, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const TYPE_STYLES: Record<Recommendation['type'], { icon: typeof Lightbulb; color: string; bg: string; border: string }> = {
  info: {
    icon: Lightbulb,
    color: 'rgb(77, 163, 255)',
    bg: 'rgba(77, 163, 255, 0.08)',
    border: 'rgba(77, 163, 255, 0.2)',
  },
  action: {
    icon: ArrowRight,
    color: 'rgb(245, 184, 74)',
    bg: 'rgba(245, 184, 74, 0.08)',
    border: 'rgba(245, 184, 74, 0.2)',
  },
  positive: {
    icon: CheckCircle2,
    color: 'rgb(56, 210, 122)',
    bg: 'rgba(56, 210, 122, 0.08)',
    border: 'rgba(56, 210, 122, 0.2)',
  },
};

export function RecommendationsCard() {
  const { latestScan, scanHistory } = useAppStore();

  const recommendations = useMemo(
    () => (latestScan ? generateRecommendations(latestScan, scanHistory) : []),
    [latestScan, scanHistory]
  );

  if (recommendations.length === 0) return null;

  return (
    <div
      className="card-elevated"
      style={{ overflow: 'hidden' }}
    >
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(168, 130, 255, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles style={{ width: 16, height: 16, color: 'rgb(168, 130, 255)' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
            Recommendations
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recommendations.map((rec) => {
            const style = TYPE_STYLES[rec.type];
            const Icon = style.icon;
            return (
              <div
                key={rec.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: style.bg,
                  border: `1px solid ${style.border}`,
                }}
              >
                <Icon
                  style={{ width: 16, height: 16, color: style.color, flexShrink: 0, marginTop: 1 }}
                />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'rgb(232, 237, 245)', margin: 0 }}>
                    {rec.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgb(169, 180, 194)', margin: 0, marginTop: 2, lineHeight: 1.5 }}>
                    {rec.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
