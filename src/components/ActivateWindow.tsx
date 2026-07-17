import { useState } from 'react';
import { Key, Crown, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export function ActivateWindow({ onComplete }: { onComplete: () => void }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim() || !window.electronAPI) return;

    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await window.electronAPI.activateLicense(licenseKey.trim());
      if (result.success) {
        setSuccess(true);
        setTimeout(() => onComplete(), 1500);
      } else {
        setError(result.error || 'Invalid license key. Please check and try again.');
      }
    } catch {
      setError('Network error. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFree = () => {
    localStorage.setItem('licenseSkipped', 'true');
    onComplete();
  };

  const handleGetPro = () => {
    window.electronAPI?.openExternal('https://cachepilot.gumroad.com/l/cache-pilot');
  };

  const formatKeyInput = (value: string) => {
    // Allow only alphanumeric and dashes, auto-format with dashes
    const cleaned = value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
    setLicenseKey(cleaned);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgb(15, 17, 21)',
        color: 'rgb(232, 237, 245)',
      }}
    >
      <div
        style={{
          width: 480,
          padding: 48,
          borderRadius: 24,
          background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(26, 32, 40) 100%)',
          border: '1px solid rgb(43, 52, 65)',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(77, 163, 255, 0.05))',
            border: '1px solid rgba(77, 163, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Crown className="w-8 h-8" style={{ color: 'rgb(77, 163, 255)' }} />
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: 'rgb(232, 237, 245)' }}>
          Welcome to CachePilot
        </h1>
        <p style={{ fontSize: 14, color: 'rgb(116, 130, 148)', marginBottom: 32 }}>
          Enter your license key to unlock Pro features, or continue with the free plan.
        </p>

        {/* License Key Input */}
        {!success && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 12,
                border: error ? '1px solid rgba(255, 107, 107, 0.4)' : '1px solid rgb(43, 52, 65)',
                background: 'rgb(15, 17, 21)',
              }}
            >
              <Key className="w-4 h-4" style={{ color: 'rgb(116, 130, 148)', flexShrink: 0 }} />
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => formatKeyInput(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && handleActivate()}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'rgb(232, 237, 245)',
                  fontSize: 15,
                  fontFamily: 'monospace',
                  letterSpacing: 1,
                }}
              />
            </div>
            {error && (
              <p style={{ fontSize: 12, color: 'rgb(255, 107, 107)', marginTop: 8, textAlign: 'left' }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: 16,
              borderRadius: 12,
              background: 'rgba(56, 210, 122, 0.1)',
              border: '1px solid rgba(56, 210, 122, 0.25)',
              marginBottom: 16,
            }}
          >
            <CheckCircle className="w-5 h-5" style={{ color: 'rgb(56, 210, 122)' }} />
            <span style={{ color: 'rgb(56, 210, 122)', fontWeight: 600 }}>License activated! Loading...</span>
          </div>
        )}

        {/* Activate Button */}
        {!success && (
          <button
            onClick={handleActivate}
            disabled={isLoading || !licenseKey.trim()}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 12,
              border: 'none',
              background: licenseKey.trim() ? 'rgb(77, 163, 255)' : 'rgb(43, 52, 65)',
              color: licenseKey.trim() ? 'white' : 'rgb(116, 130, 148)',
              fontSize: 14,
              fontWeight: 600,
              cursor: licenseKey.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Activate Pro
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {/* Get Pro Link */}
        {!success && (
          <button
            onClick={handleGetPro}
            style={{
              width: '100%',
              padding: '10px 24px',
              marginTop: 8,
              border: 'none',
              background: 'transparent',
              color: 'rgb(77, 163, 255)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Don't have a key? Get Pro — $29.99/year
          </button>
        )}

        {/* Divider */}
        {!success && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgb(43, 52, 65)' }} />
              <span style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgb(43, 52, 65)' }} />
            </div>

            {/* Continue Free */}
            <button
              onClick={handleContinueFree}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid rgb(43, 52, 65)',
                background: 'transparent',
                color: 'rgb(168, 130, 255)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Continue with Free (3 scans/day)
            </button>
          </>
        )}

        {/* Features Preview */}
        {!success && (
          <div style={{ marginTop: 28, textAlign: 'left' }}>
            <p style={{ fontSize: 11, color: 'rgb(116, 130, 148)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Pro includes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Unlimited scans',
                'Smart recommendations',
                'Health score & lifetime stats',
                'Export results (JSON/CSV)',
                'Scheduled & background scans',
              ].map((feature) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: 'rgb(56, 210, 122)', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'rgb(168, 179, 194)' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
