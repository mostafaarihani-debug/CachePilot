import { useEffect, useRef } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  warnings?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'rgba(255, 107, 107, 0.1)',
    iconColor: '#FF6B6B',
    btnBg: '#FF6B6B',
    border: 'rgba(255, 107, 107, 0.2)',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'rgba(245, 184, 74, 0.1)',
    iconColor: '#F5B84A',
    btnBg: '#F5B84A',
    border: 'rgba(245, 184, 74, 0.2)',
  },
  info: {
    icon: CheckCircle2,
    iconBg: 'rgba(77, 163, 255, 0.1)',
    iconColor: '#4DA3FF',
    btnBg: '#4DA3FF',
    border: 'rgba(77, 163, 255, 0.2)',
  },
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  warnings = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const style = variantStyles[variant];
  const Icon = style.icon;
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
          onCancel();
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
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      data-modal-overlay
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={onCancel}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          width: 440,
          maxWidth: '90vw',
          background: 'rgb(21, 26, 33)',
          border: `1px solid ${style.border}`,
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: style.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon style={{ width: 24, height: 24, color: style.iconColor }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: 'rgb(232, 237, 245)', margin: 0 }}>
              {title}
            </h3>
            <p style={{ fontSize: 14, color: 'rgb(169, 180, 194)', marginTop: 8 }}>
              {message}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: 'rgb(116, 130, 148)',
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {warnings.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              background: 'rgba(245, 184, 74, 0.05)',
              border: '1px solid rgba(245, 184, 74, 0.15)',
            }}
          >
            {warnings.map((warning, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < warnings.length - 1 ? 8 : 0 }}>
                <AlertTriangle style={{ width: 14, height: 14, color: '#F5B84A', marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'rgb(169, 180, 194)' }}>{warning}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: '1px solid rgb(43, 52, 65)',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'rgb(169, 180, 194)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: style.btnBg,
              border: 'none',
              borderRadius: 8,
              padding: '8px 16px',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
