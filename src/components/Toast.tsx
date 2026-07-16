import { useToastStore, type Toast as ToastType } from '../store/toastStore';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ICONS: Record<ToastType['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_THEME: Record<ToastType['type'], {
  border: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  glow: string;
  titleColor: string;
  msgColor: string;
  progressColor: string;
}> = {
  success: {
    border: 'rgba(34, 197, 94, 0.3)',
    bg: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(22, 163, 74, 0.04) 100%)',
    iconBg: 'rgba(34, 197, 94, 0.15)',
    iconColor: '#4ade80',
    glow: '0 0 20px rgba(34, 197, 94, 0.1)',
    titleColor: '#e5e7eb',
    msgColor: '#9ca3af',
    progressColor: '#22c55e',
  },
  error: {
    border: 'rgba(239, 68, 68, 0.3)',
    bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%)',
    iconBg: 'rgba(239, 68, 68, 0.15)',
    iconColor: '#f87171',
    glow: '0 0 20px rgba(239, 68, 68, 0.1)',
    titleColor: '#e5e7eb',
    msgColor: '#9ca3af',
    progressColor: '#ef4444',
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.3)',
    bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.04) 100%)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
    glow: '0 0 20px rgba(245, 158, 11, 0.1)',
    titleColor: '#e5e7eb',
    msgColor: '#9ca3af',
    progressColor: '#f59e0b',
  },
  info: {
    border: 'rgba(59, 130, 246, 0.3)',
    bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
    iconBg: 'rgba(59, 130, 246, 0.15)',
    iconColor: '#60a5fa',
    glow: '0 0 20px rgba(59, 130, 246, 0.1)',
    titleColor: '#e5e7eb',
    msgColor: '#9ca3af',
    progressColor: '#3b82f6',
  },
};

interface Props {
  toast: ToastType;
}

export default function Toast({ toast }: Props) {
  const removeToast = useToastStore((s) => s.removeToast);
  const Icon = ICONS[toast.type];
  const theme = TOAST_THEME[toast.type];

  return (
    <div
      style={{
        background: theme.bg,
        border: `1px solid ${theme.border}`,
        borderLeft: `3px solid ${theme.progressColor}`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), ${theme.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.03)`,
        backdropFilter: 'blur(20px) saturate(180%)',
        minWidth: 320,
        maxWidth: 420,
        borderRadius: 14,
        animation: 'toastSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="flex items-start gap-3 px-4 py-3.5"
    >
      {/* Icon */}
      <div
        style={{
          background: theme.iconBg,
          borderRadius: 10,
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color: theme.iconColor }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p style={{ fontSize: 13.5, fontWeight: 600, color: theme.titleColor, lineHeight: 1.3 }}>
          {toast.title}
        </p>
        {toast.message && (
          <p style={{ fontSize: 12.5, color: theme.msgColor, marginTop: 3, lineHeight: 1.45 }}>
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => removeToast(toast.id)}
        style={{
          color: '#6b7280',
          transition: 'color 0.15s',
          flexShrink: 0,
          marginTop: 1,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#d1d5db')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
      >
        <X size={14} />
      </button>
    </div>
  );
}
