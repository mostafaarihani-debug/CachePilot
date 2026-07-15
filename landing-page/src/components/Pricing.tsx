import { motion } from 'framer-motion';
import { Check, X, Download, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to keep your PC clean.',
    cta: 'Download Free',
    ctaStyle: 'secondary' as const,
    features: [
      { text: '12 cache categories', included: true },
      { text: '3 scans per day', included: true },
      { text: 'Real-time scan progress', included: true },
      { text: 'File preview before delete', included: true },
      { text: 'Scan history (200 sessions)', included: true },
      { text: 'Smart recommendations', included: false },
      { text: 'Health score', included: false },
      { text: 'Scheduled scans', included: false },
      { text: 'Auto-clean on schedule', included: false },
      { text: 'Export results', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/year',
    description: 'For power users who want full control.',
    cta: 'Get Pro',
    ctaStyle: 'primary' as const,
    badge: 'Popular',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Unlimited scans', included: true },
      { text: 'Smart recommendations', included: true },
      { text: 'Health score & lifetime stats', included: true },
      { text: 'Scheduled & background scans', included: true },
      { text: 'Auto-clean on schedule', included: true },
      { text: 'Export results (JSON/CSV)', included: true },
      { text: 'Priority support', included: true },
      { text: 'Lifetime stats tracking', included: true },
      { text: 'Custom scan paths', included: true },
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" style={{
      padding: '120px 24px',
      position: 'relative',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
            Pricing
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
            Start free. Upgrade when ready.
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
            No credit card required. Try CachePilot free for as long as you want.
          </motion.p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}>
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={plan.badge ? 'card glow-accent' : 'card'}
              style={{
                padding: 32,
                position: 'relative',
                border: plan.badge ? '1px solid rgba(77, 163, 255, 0.3)' : undefined,
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: -12,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  padding: '4px 16px',
                  background: 'linear-gradient(135deg, #4DA3FF, #2B8AFF)',
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Crown style={{ width: 12, height: 12 }} />
                  {plan.badge}
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  marginBottom: 8,
                }}>
                  {plan.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 40,
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '-0.02em',
                  }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 15, color: '#8A94A6' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 14, color: '#8A94A6', margin: 0 }}>
                  {plan.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                marginBottom: 28,
                paddingTop: 24,
                borderTop: '1px solid #2B3441',
              }}>
                {plan.features.map((feature) => (
                  <div
                    key={feature.text}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    {feature.included ? (
                      <Check style={{ width: 16, height: 16, color: '#38D27A', flexShrink: 0 }} />
                    ) : (
                      <X style={{ width: 16, height: 16, color: '#5A6478', flexShrink: 0 }} />
                    )}
                    <span style={{
                      fontSize: 14,
                      color: feature.included ? '#E8EDF5' : '#5A6478',
                    }}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={plan.ctaStyle === 'primary' ? 'https://cachepilot.gumroad.com/l/cache-pilot' : '#download'}
                className={plan.ctaStyle === 'primary' ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', textAlign: 'center' }}
              >
                {plan.ctaStyle === 'primary' ? (
                  <Crown style={{ width: 16, height: 16 }} />
                ) : (
                  <Download style={{ width: 16, height: 16 }} />
                )}
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          #pricing > div > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
