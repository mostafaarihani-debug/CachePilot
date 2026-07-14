import { useEffect, useState } from 'react';
import { useAppStore, formatSize, formatDate, runScan } from '../store';
import {
  Search,
  Shield,
  HardDrive,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { ScanProgress } from '../components/ScanProgress';
import { DashboardSkeleton } from '../components/Skeleton';
import { RecommendationsCard } from '../components/RecommendationsCard';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { LifetimeStatsCard } from '../components/LifetimeStatsCard';
import { UpgradeModal } from '../components/UpgradeModal';
import { ProBadge } from '../components/ProBadge';
import { isPro } from '../utils/isPro';

export function Dashboard() {
  const { latestScan, isScanning, setCurrentPage, licenseStatus, scanCountInfo, setScanCountInfo } = useAppStore();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showActivateWindow, setShowActivateWindow] = useState(false);

  const userIsPro = isPro(licenseStatus);

  useEffect(() => {
    window.electronAPI?.isAdmin().then(setAdminStatus);
    window.electronAPI?.onTriggerScan(() => {
      handleScan();
    });

    // Load scan count
    window.electronAPI?.getScanCount().then((info) => {
      setScanCountInfo(info);
    });

    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <DashboardSkeleton />;

  const handleScan = async () => {
    // Check scan limit for free users
    if (!userIsPro && scanCountInfo && !scanCountInfo.canScan) {
      setShowUpgradeModal(true);
      return;
    }

    setCurrentPage('scan');
    const result = await runScan();

    // If result is null, scan limit was reached
    if (result === null) {
      setShowUpgradeModal(true);
    }
  };

  const handleElevate = () => {
    window.electronAPI?.requestElevation();
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {adminStatus === false && (
          <div className="flex items-center justify-between p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm font-medium text-txt">Not running as administrator</p>
                <p className="text-xs text-txt-secondary">
                  Some cache files may be locked. Run as admin for full access.
                </p>
              </div>
            </div>
            <button onClick={handleElevate} className="btn-ghost text-warning text-sm">
              Elevate
            </button>
          </div>
        )}

        {adminStatus === true && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-sm text-success font-medium">Running as administrator</span>
          </div>
        )}

        {/* Scan Count Banner for Free Users */}
        {!userIsPro && scanCountInfo && (
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: scanCountInfo.canScan
                ? 'linear-gradient(135deg, rgba(77, 163, 255, 0.08), rgba(168, 130, 255, 0.08))'
                : 'linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 167, 38, 0.08))',
              border: scanCountInfo.canScan
                ? '1px solid rgba(77, 163, 255, 0.2)'
                : '1px solid rgba(255, 107, 107, 0.2)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-txt-secondary">Scans today:</span>
                <span className="text-sm font-semibold text-txt">
                  {scanCountInfo.count}/{scanCountInfo.limit}
                </span>
              </div>
              {!scanCountInfo.canScan && (
                <ProBadge size="sm" onClick={() => setShowUpgradeModal(true)} />
              )}
            </div>
            {!scanCountInfo.canScan && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-txt tracking-tight">Dashboard</h1>
            <p className="text-txt-secondary mt-1">Scan and clean your PC cache safely</p>
          </div>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="btn-primary text-base px-6 py-3"
          >
            {isScanning ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Scan Now
              </>
            )}
          </button>
        </div>

        <ScanProgress />

        <div className="grid grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-txt-secondary">Total Found</span>
            </div>
            <p className="text-2xl font-bold text-txt">
              {latestScan ? formatSize(latestScan.totalSize) : '0 B'}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <span className="text-sm text-txt-secondary">Categories</span>
            </div>
            <p className="text-2xl font-bold text-txt">
              {latestScan ? latestScan.categories.length : 0}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-txt-secondary">Last Scan</span>
            </div>
            <p className="text-2xl font-bold text-txt">
              {latestScan ? formatDate(latestScan.date) : 'Never'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <HealthScoreCard />
          {userIsPro ? (
            <RecommendationsCard />
          ) : (
            <div className="card relative overflow-hidden">
              <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(15, 17, 21, 0.85)' }}>
                <ProBadge size="md" onClick={() => setShowUpgradeModal(true)} />
                <p className="text-sm text-txt-secondary mt-3">Smart recommendations</p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs text-primary mt-2 hover:underline"
                >
                  Upgrade to unlock
                </button>
              </div>
              <RecommendationsCard />
            </div>
          )}
        </div>

        {userIsPro ? (
          <LifetimeStatsCard />
        ) : (
          <div className="card relative overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(15, 17, 21, 0.85)' }}>
              <ProBadge size="md" onClick={() => setShowUpgradeModal(true)} />
              <p className="text-sm text-txt-secondary mt-3">Lifetime statistics</p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs text-primary mt-2 hover:underline"
              >
                Upgrade to unlock
              </button>
            </div>
            <LifetimeStatsCard />
          </div>
        )}

        {latestScan ? (
          <div className="card-elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-txt">Latest Scan Results</h2>
              <button
                onClick={() => setCurrentPage('scan')}
                className="btn-ghost text-primary"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {latestScan.categories.slice(0, 5).map((cat) => (
                <div
                  key={cat.categoryId}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        cat.safetyLevel === 'safe'
                          ? 'bg-success'
                          : cat.safetyLevel === 'caution'
                          ? 'bg-warning'
                          : 'bg-danger'
                      }`}
                    />
                    <span className="text-sm text-txt">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-txt-muted">
                      {cat.itemCount} items
                    </span>
                    <span className="text-sm font-medium text-txt-secondary">
                      {formatSize(cat.totalSize)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card-elevated text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-txt mb-2">No scans yet</h3>
            <p className="text-txt-secondary max-w-md mx-auto">
              Click "Scan Now" to find cache files on your PC. We will show you what can be cleaned safely.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-txt mb-1">Safe Cleanup</h3>
                <p className="text-xs text-txt-secondary">
                  We only clean safe categories by default. Risky actions require your confirmation.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-txt mb-1">Local & Private</h3>
                <p className="text-xs text-txt-secondary">
                  All scan data stays on your PC. Nothing is sent to the internet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onActivateKey={() => setShowActivateWindow(true)}
      />

      {showActivateWindow && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div
            style={{
              width: 440,
              padding: 32,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(26, 32, 40) 100%)',
              border: '1px solid rgb(43, 52, 65)',
              textAlign: 'center',
            }}
          >
            <p className="text-sm text-txt-secondary mb-4">Enter your license key to activate Pro.</p>
            <input
              type="text"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
              id="license-key-input"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgb(43, 52, 65)',
                background: 'rgb(15, 17, 21)',
                color: 'rgb(232, 237, 245)',
                fontSize: 15,
                fontFamily: 'monospace',
                outline: 'none',
                marginBottom: 16,
                boxSizing: 'border-box',
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  const input = document.getElementById('license-key-input') as HTMLInputElement;
                  if (input?.value && window.electronAPI) {
                    const result = await window.electronAPI.activateLicense(input.value.trim());
                    if (result.success) {
                      useAppStore.getState().setLicenseStatus(result.status);
                      setShowActivateWindow(false);
                    }
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold"
              >
                Activate
              </button>
              <button
                onClick={() => setShowActivateWindow(false)}
                className="px-4 py-2.5 rounded-lg border border-bdr text-txt-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
