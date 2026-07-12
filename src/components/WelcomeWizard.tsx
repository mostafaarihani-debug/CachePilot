import { useState } from 'react';
import { Shield, Eye, Sparkles, AlertTriangle, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAppStore } from '../store';

const WIZARD_KEY = 'cachepilot_wizard_completed';

export function hasCompletedWizard(): boolean {
  try {
    return localStorage.getItem(WIZARD_KEY) === 'true';
  } catch {
    return false;
  }
}

function completeWizard() {
  try {
    localStorage.setItem(WIZARD_KEY, 'true');
  } catch {}
}

interface Step {
  title: string;
  subtitle: string;
  icon: typeof Shield;
  color: string;
  bg: string;
  content: string[];
}

const STEPS: Step[] = [
  {
    title: 'Welcome to CachePilot',
    subtitle: 'Your trusted PC cache cleaner',
    icon: Sparkles,
    color: 'rgb(77, 163, 255)',
    bg: 'rgba(77, 163, 255, 0.1)',
    content: [
      'CachePilot helps you clean temporary files that slow down your PC.',
      'It scans 12 different cache types and shows you exactly what can be cleaned.',
      'Everything happens locally on your computer. Nothing is sent to the internet.',
    ],
  },
  {
    title: 'Your Privacy Matters',
    subtitle: 'Local-first, always',
    icon: Eye,
    color: 'rgb(56, 210, 122)',
    bg: 'rgba(56, 210, 122, 0.1)',
    content: [
      'All scan data is stored only on your PC using local browser storage.',
      'No data ever leaves your computer. No accounts required.',
      'You can delete all data at any time from Settings.',
    ],
  },
  {
    title: 'How CachePilot Works',
    subtitle: 'Simple and transparent',
    icon: Shield,
    color: 'rgb(39, 211, 181)',
    bg: 'rgba(39, 211, 181, 0.1)',
    content: [
      'Scan: CachePilot checks 12 cache categories on your system.',
      'Review: See exactly what was found with clear explanations.',
      'Clean: Choose what to clean. Safe categories are selected by default.',
    ],
  },
  {
    title: 'Safety First',
    subtitle: 'We protect what matters',
    icon: AlertTriangle,
    color: 'rgb(245, 184, 74)',
    bg: 'rgba(245, 184, 74, 0.1)',
    content: [
      'Every cache type is labeled: Safe, Caution, or Risky.',
      'Safe categories are pre-selected and have no side effects.',
      'Caution categories may sign you out of websites. We always warn you first.',
      'You are always in control. Nothing is deleted without your permission.',
    ],
  },
];

export function WelcomeWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const { setCurrentPage } = useAppStore();

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  const handleFinish = () => {
    completeWizard();
    onComplete();
  };

  const handleScanNow = () => {
    completeWizard();
    setCurrentPage('scan');
    onComplete();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          width: 520,
          maxWidth: '90vw',
          background: 'rgb(21, 26, 33)',
          border: '1px solid rgb(43, 52, 65)',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '40px 40px 0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: current.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: `1px solid ${current.color}33`,
            }}
          >
            <Icon style={{ width: 36, height: 36, color: current.color }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(232, 237, 245)', margin: 0 }}>
            {current.title}
          </h2>
          <p style={{ fontSize: 14, color: 'rgb(116, 130, 148)', marginTop: 6 }}>
            {current.subtitle}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {current.content.map((text, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgb(26, 32, 40)',
                  border: '1px solid rgb(43, 52, 65)',
                }}
              >
                <Check
                  style={{
                    width: 14,
                    height: 14,
                    color: current.color,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <span style={{ fontSize: 13, color: 'rgb(169, 180, 194)', lineHeight: 1.5 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0 40px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === step ? current.color : 'rgb(43, 52, 65)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'transparent',
                  border: '1px solid rgb(43, 52, 65)',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: 'rgb(169, 180, 194)',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft style={{ width: 14, height: 14 }} />
                Back
              </button>
            )}

            {isLast ? (
              <>
                <button
                  onClick={handleFinish}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgb(77, 163, 255)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Get Started
                </button>
                <button
                  onClick={handleScanNow}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'rgb(56, 210, 122)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    color: 'white',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Scan Now
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setStep(step + 1)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgb(77, 163, 255)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 16px',
                  color: 'white',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Next
                <ArrowRight style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
