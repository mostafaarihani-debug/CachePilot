import { motion } from 'framer-motion';
import { Scan, Eye, Trash2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Scan,
    title: 'Scan',
    description: 'CachePilot checks 12 cache locations across your system. Everything is read-only — nothing is deleted during the scan.',
    color: '#4DA3FF',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Review',
    description: 'See exactly what each cache contains, how much space it takes, and what cleaning it means for your system.',
    color: '#F5B84A',
  },
  {
    number: '03',
    icon: Trash2,
    title: 'Clean',
    description: 'Select which caches to clear and confirm. You choose what goes — no auto-deletes, no surprises.',
    color: '#38D27A',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      padding: '120px 24px',
      background: 'linear-gradient(180deg, #0B0D11 0%, #111520 50%, #0B0D11 100%)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#4DA3FF',
            }}
          >
            How It Works
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: 40,
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              marginTop: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Three steps to a faster PC.
          </motion.h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 32,
          position: 'relative',
        }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            top: 60,
            left: '16.67%',
            right: '16.67%',
            height: 1,
            background: 'linear-gradient(90deg, #4DA3FF, #F5B84A, #38D27A)',
            opacity: 0.3,
          }} />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Step number circle */}
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#111520',
                border: `2px solid ${step.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                position: 'relative',
              }}>
                <step.icon style={{ width: 24, height: 24, color: step.color }} />
                <div style={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: step.color,
                  color: '#0B0D11',
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {step.number}
                </div>
              </div>

              <h3 style={{
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                marginBottom: 12,
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: 15,
                color: '#8A94A6',
                lineHeight: 1.6,
                maxWidth: 280,
                margin: '0 auto',
              }}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #how-it-works > div > div:last-child { grid-template-columns: 1fr !important; gap: 48px !important; }
          #how-it-works > div > div:last-child > div { display: none !important; }
        }
      `}</style>
    </section>
  );
}
