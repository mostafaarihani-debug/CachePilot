import { useToastStore } from '../store/toastStore';
import Toast from './Toast';

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          0% {
            opacity: 0;
            transform: translateX(40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          alignItems: 'flex-end',
        }}
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
}
