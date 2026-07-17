import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface ConsentDialogProps {
  onConsent: (consent: 'yes' | 'no') => void;
}

export function ConsentDialog({ onConsent }: ConsentDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getTelemetryConsent().then((consent) => {
        if (consent === 'unset') {
          setTimeout(() => setVisible(true), 2000);
        }
      });
    }
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1d27 0%, #12141c 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 16,
        padding: '32px',
        maxWidth: 440,
        width: '90%',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Shield size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ color: '#f0f0f0', fontSize: 18, fontWeight: 600, margin: 0 }}>
              Help Improve CachePilot
            </h2>
            <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
              Anonymous usage data only
            </p>
          </div>
        </div>

        <p style={{ color: '#9ca3af', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
          CachePilot can send anonymous usage data to help us fix bugs and improve the app.
          We <strong style={{ color: '#f0f0f0' }}>never</strong> collect personal files, file names, or any identifying information.
        </p>

        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 20,
        }}>
          <p style={{ color: '#93c5fd', fontSize: 12, fontWeight: 500, margin: '0 0 6px 0' }}>
            What we collect:
          </p>
          <ul style={{ color: '#9ca3af', fontSize: 12, margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>App version and Windows version</li>
            <li>Which features you use</li>
            <li>Crash reports (anonymized)</li>
            <li>Performance metrics</li>
          </ul>
        </div>

        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          borderRadius: 10,
          padding: '12px 14px',
          marginBottom: 24,
        }}>
          <p style={{ color: '#fca5a5', fontSize: 12, fontWeight: 500, margin: '0 0 6px 0' }}>
            What we NEVER collect:
          </p>
          <ul style={{ color: '#9ca3af', fontSize: 12, margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
            <li>Your files or file names</li>
            <li>Your username or computer name</li>
            <li>Any personal information</li>
          </ul>
        </div>

        <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 20, textAlign: 'center' }}>
          You can change this anytime in Settings &gt; Privacy.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              window.electronAPI?.setTelemetryConsent('no');
              setVisible(false);
              onConsent('no');
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'transparent',
              color: '#9ca3af',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.color = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#9ca3af';
            }}
          >
            No Thanks
          </button>
          <button
            onClick={() => {
              window.electronAPI?.setTelemetryConsent('yes');
              setVisible(false);
              onConsent('yes');
            }}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
            }}
          >
            Enable Anonymous Data
          </button>
        </div>
      </div>
    </div>
  );
}
