import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';

function GithubIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function TwitterIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function Footer() {
  return (
    <>
      {/* Final CTA */}
      <section id="download" style={{
        padding: '120px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 400,
          background: 'radial-gradient(ellipse, rgba(77, 163, 255, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            fontSize: 44,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            marginBottom: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Ready to clean up?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontSize: 17,
            color: '#8A94A6',
            maxWidth: 400,
            margin: '0 auto 32px',
            lineHeight: 1.6,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Download CachePilot for free. No account needed.
          Your PC stays fast, your files stay safe.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <a
            href="https://github.com/mostafaarihani-debug/CachePilot/releases/latest"
            className="btn-primary"
            style={{ fontSize: 16, padding: '18px 36px' }}
          >
            <Download style={{ width: 20, height: 20 }} />
            Download CachePilot
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: 13,
            color: '#5A6478',
            marginTop: 20,
            position: 'relative',
            zIndex: 1,
          }}
        >
          Windows 10/11 · Free & Open Source · No ads, no tracking
        </motion.p>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px',
        borderTop: '1px solid #2B3441',
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4DA3FF, #2B8AFF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 800,
              color: 'white',
              fontFamily: 'var(--font-display)',
            }}>
              C
            </div>
            <span style={{
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'var(--font-display)',
              color: '#8A94A6',
            }}>
              CachePilot
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a
              href="https://github.com/mostafaarihani-debug/CachePilot"
              style={{ color: '#5A6478', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E8EDF5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6478')}
            >
              <GithubIcon />
            </a>
            <a
              href="https://twitter.com/cachepilot"
              style={{ color: '#5A6478', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E8EDF5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6478')}
            >
              <TwitterIcon />
            </a>
            <a
              href="mailto:support@cachepilot.app"
              style={{ color: '#5A6478', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#E8EDF5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#5A6478')}
            >
              <Mail style={{ width: 18, height: 18 }} />
            </a>
          </div>

          <span style={{ fontSize: 13, color: '#5A6478' }}>
            © 2026 CachePilot. Built with care.
          </span>
        </div>
      </footer>
    </>
  );
}
