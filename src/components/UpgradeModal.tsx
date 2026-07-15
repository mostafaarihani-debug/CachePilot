import { useEffect, useRef } from 'react';
import { Crown, CheckCircle, ArrowRight } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivateKey?: () => void;
}

export function UpgradeModal({ isOpen, onClose, onActivateKey }: UpgradeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const modal = modalRef.current;
      const focusable = modal?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }

      const keyHandler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }
        if (e.key === 'Tab' && focusable && focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };
      window.addEventListener('keydown', keyHandler);
      return () => window.removeEventListener('keydown', keyHandler);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGetPro = () => {
    window.electronAPI?.openExternal('https://cachepilot.gumroad.com/l/cache-pilot');
  };

  const handleEnterKey = () => {
    onClose();
    onActivateKey?.();
  };

  return (
    <div
      data-modal-overlay
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 440,
          borderRadius: 20,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(26, 32, 40) 100%)',
          border: '1px solid rgb(43, 52, 65)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '32px 32px 0',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(77, 163, 255, 0.05))',
              border: '1px solid rgba(77, 163, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Crown className="w-7 h-7" style={{ color: 'rgb(77, 163, 255)' }} />
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'rgb(232, 237, 245)' }}>
            Daily scan limit reached
          </h2>
          <p style={{ fontSize: 14, color: 'rgb(116, 130, 148)', marginBottom: 4 }}>
            You've used all 3 free scans today.
          </p>
          <p style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>
            Upgrade to Pro for unlimited access.
          </p>
        </div>

        {/* Features */}
        <div style={{ padding: '24px 32px' }}>
          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: 'rgb(15, 17, 21)',
              border: '1px solid rgb(43, 52, 65)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Unlimited scans per day',
                'Smart recommendations',
                'Health score & lifetime stats',
                'Export results (JSON/CSV)',
                'Scheduled & background scans',
                'Auto-clean on schedule',
              ].map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle className="w-4 h-4" style={{ color: 'rgb(56, 210, 122)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'rgb(168, 179, 194)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleGetPro}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: 'rgb(77, 163, 255)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            Upgrade to Pro — $29.99/year
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleEnterKey}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 12,
              border: '1px solid rgb(43, 52, 65)',
              background: 'transparent',
              color: 'rgb(168, 130, 255)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Enter License Key
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px 24px',
              border: 'none',
              background: 'transparent',
              color: 'rgb(116, 130, 148)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
