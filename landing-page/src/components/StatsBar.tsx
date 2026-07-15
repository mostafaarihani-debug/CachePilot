import { motion } from 'framer-motion';
import { Shield, Eye, MousePointerClick, Layers } from 'lucide-react';

const stats = [
  { icon: Layers, value: '12', label: 'Cache categories', color: '#4DA3FF' },
  { icon: MousePointerClick, value: '1-click', label: 'Scan & clean', color: '#38D27A' },
  { icon: Eye, value: '100%', label: 'Transparent', color: '#F5B84A' },
  { icon: Shield, value: 'Zero', label: 'Risk to files', color: '#FF6B6B' },
];

export function StatsBar() {
  return (
    <section style={{
      padding: '0 24px',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        maxWidth: 1000,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: '#2B3441',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              padding: '28px 24px',
              background: '#111520',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `${stat.color}10`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <stat.icon style={{ width: 22, height: 22, color: stat.color }} />
            </div>
            <div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                color: '#E8EDF5',
                lineHeight: 1,
              }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#8A94A6', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
