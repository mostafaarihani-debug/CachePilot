import { motion } from 'framer-motion';
import {
  Globe, HardDrive, RefreshCw, Image, Link, FileWarning,
  Cpu, Database, Gauge, Clock, Layers, Brush
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Browser Cache',
    description: 'Stored website files that speed up revisits but pile up over time. Clean to reclaim space safely.',
    color: '#4DA3FF',
  },
  {
    icon: HardDrive,
    title: 'System Temp Files',
    description: 'Leftover files from installs and updates. Safe to remove — Windows recreates what it needs.',
    color: '#38D27A',
  },
  {
    icon: RefreshCw,
    title: 'Windows Update Cache',
    description: 'Old update installers that can grow to gigabytes. Cleaning may require re-downloading updates.',
    color: '#F5B84A',
  },
  {
    icon: Image,
    title: 'Thumbnail Cache',
    description: 'Preview images for files in Explorer. Rebuilds automatically — safe and quick to clean.',
    color: '#FF6B6B',
  },
  {
    icon: Link,
    title: 'DNS Cache',
    description: 'Website address records your PC remembers. Flushing forces fresh lookups — no risk involved.',
    color: '#A78BFA',
  },
  {
    icon: FileWarning,
    title: 'Crash Dumps',
    description: 'Error logs from app crashes. Useful for debugging but otherwise just takes up disk space.',
    color: '#FB923C',
  },
  {
    icon: Cpu,
    title: 'GPU Shader Cache',
    description: 'Pre-compiled graphics shaders for games. May cause brief stuttering after cleaning as they rebuild.',
    color: '#38D27A',
  },
  {
    icon: Database,
    title: 'Windows Prefetch',
    description: 'App launch data that speeds up startup. First launches may be slower after cleaning.',
    color: '#4DA3FF',
  },
  {
    icon: Gauge,
    title: 'Font Cache',
    description: 'Rendered font data for faster text display. Windows rebuilds this automatically when needed.',
    color: '#F5B84A',
  },
  {
    icon: Clock,
    title: 'Event Logs',
    description: 'System event history used for diagnostics. Safe to clear unless you need recent audit trails.',
    color: '#FF6B6B',
  },
  {
    icon: Layers,
    title: 'Delivery Optimization',
    description: 'Windows Update delivery cache. Files shared with other PCs on your network.',
    color: '#A78BFA',
  },
  {
    icon: Brush,
    title: 'Software Distribution',
    description: 'Temporary files from Windows Store and Update services. Safe to clean periodically.',
    color: '#FB923C',
  },
];

export function Features() {
  return (
    <section id="features" style={{
      padding: '120px 24px',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#4DA3FF',
            }}>
              What CachePilot Cleans
            </span>
          </motion.div>

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
            12 cache types. Every one explained.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: 17,
              color: '#8A94A6',
              maxWidth: 520,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            CachePilot tells you what each cache is, why it exists,
            what you gain by cleaning it, and what might change.
          </motion.p>
        </div>

        {/* Feature grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}>
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="card"
              style={{ padding: 24 }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${feature.color}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <feature.icon style={{ width: 20, height: 20, color: feature.color }} />
              </div>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                margin: 0,
                marginBottom: 8,
                fontFamily: 'var(--font-display)',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: '#8A94A6',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #features > div > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          #features > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
