import { useToastStore, type Toast as ToastType } from '../store/toastStore';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ICONS: Record<ToastType['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType['type'], string> = {
  success: 'border-l-green-500 bg-green-500/10',
  error: 'border-l-red-500 bg-red-500/10',
  warning: 'border-l-yellow-500 bg-yellow-500/10',
  info: 'border-l-blue-500 bg-blue-500/10',
};

const ICON_COLORS: Record<ToastType['type'], string> = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

interface Props {
  toast: ToastType;
}

export default function Toast({ toast }: Props) {
  const removeToast = useToastStore((s) => s.removeToast);
  const Icon = ICONS[toast.type];

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 border border-[#1E2128] shadow-lg backdrop-blur-sm ${STYLES[toast.type]}`}
      style={{ minWidth: '300px', maxWidth: '420px' }}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${ICON_COLORS[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#E5E7EB]">{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-[#9CA3AF] mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[#6B7280] hover:text-[#E5E7EB] transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
