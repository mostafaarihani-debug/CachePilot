import { motion } from 'framer-motion';
import { Check, Download } from 'lucide-react';

const features = [
  '12 cache categories',
  'Unlimited scans',
  'Real-time scan progress',
  'File preview before delete',
  'Scan history (200 sessions)',
  'Smart recommendations',
  'Health score & lifetime stats',
  'Scheduled & background scans',
  'Export results (JSON/CSV)',
  'Custom scan paths',
];

export function Pricing() {
  return (
    <section id="pricing" style={{
      padding: '120px 24px',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#38D27A',
            }}
          >
            Everything Included
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
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            All features. No limits.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 17,
              color: '#8A94A6',
              maxWidth: 440,
              margin: '0 auto',
            }}
          >
            A fast, clean tool that respects your PC.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="card"
          style={{ padding: 32 }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            marginBottom: 28,
          }}>
            {features.map((feature) => (
              <div
                key={feature}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <Check style={{ width: 16, height: 16, color: '#38D27A', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: '#E8EDF5' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>

          <a
            href="https://github.com/mostafaarihani-debug/CachePilot/releases/download/v1.1.7/CachePilot-Setup-1.1.7.exe"
            className="btn-primary"
            style={{ width: '100%', textAlign: 'center' }}
          >
            <Download style={{ width: 16, height: 16 }} />
            Download
          </a>
        </motion.div>
      </div>
    </section>
  );
}
