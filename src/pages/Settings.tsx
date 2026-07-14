import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  HardDrive,
  Info,
  Clock,
  Power,
  Download,
  RefreshCw,
  CheckCircle,
  Loader2,
  AlertCircle,
  Zap,
  Globe,
  Cpu,
  Calendar,
  FolderOpen,
  Key,
  Crown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { AppSettings, AppInfo, UpdateStatus } from '../types';
import { useToastStore } from '../store/toastStore';
import { useAppStore } from '../store';
import { ProBadge } from '../components/ProBadge';
import { isPro } from '../utils/isPro';

const INTERVAL_OPTIONS = [
  { label: 'Off', value: 0 },
  { label: 'Every 30 minutes', value: 30 * 60 * 1000 },
  { label: 'Every 1 hour', value: 60 * 60 * 1000 },
  { label: 'Every 2 hours', value: 2 * 60 * 60 * 1000 },
  { label: 'Every 4 hours', value: 4 * 60 * 60 * 1000 },
  { label: 'Every 6 hours', value: 6 * 60 * 60 * 1000 },
  { label: 'Every 12 hours', value: 12 * 60 * 60 * 1000 },
  { label: 'Once daily', value: 24 * 60 * 60 * 1000 },
];

function Toggle({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-all duration-200 ${
        enabled ? 'bg-primary shadow-[0_0_12px_rgba(77,163,255,0.3)]' : 'bg-surface-3'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : onToggle}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-200 shadow-sm ${
          enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </div>
  );
}

const UPDATE_STATUS_ICONS: Record<string, typeof CheckCircle> = {
  idle: RefreshCw,
  checking: Loader2,
  available: Download,
  'not-available': CheckCircle,
  downloading: Download,
  downloaded: CheckCircle,
  error: AlertCircle,
};

const UPDATE_STATUS_LABELS: Record<string, string> = {
  idle: 'Ready to check',
  checking: 'Checking for updates...',
  available: 'Update available',
  'not-available': 'You\'re up to date',
  downloading: 'Downloading...',
  downloaded: 'Update ready to install',
  error: 'Update check failed',
};

export function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'idle' });
  const [isTaskScheduled, setIsTaskScheduled] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const { licenseStatus, setLicenseStatus } = useAppStore();
  const userIsPro = isPro(licenseStatus);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) return;
    api.getSettings().then(setSettings).catch(() => {});
    api.getAppInfo().then(setAppInfo).catch(() => {});
    api.getUpdateStatus().then(setUpdateStatus).catch(() => {});
    api.getScheduledScan().then(setIsTaskScheduled).catch(() => {});

    api.onUpdateStatus((status: UpdateStatus) => {
      setUpdateStatus(status);
      if (status.status === 'downloaded') {
        addToast({
          type: 'success',
          title: 'Update Ready',
          message: `Version ${status.version} downloaded. Restart to install.`,
        });
      }
      if (status.status === 'error') {
        addToast({
          type: 'error',
          title: 'Update Error',
          message: status.message,
        });
      }
    });
  }, []);

  const update = async (partial: Partial<AppSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...partial };
    setSettings(updated);
    await window.electronAPI?.saveSettings(partial);
  };

  const handleCheckUpdate = async () => {
    setUpdateStatus({ status: 'checking' });
    await window.electronAPI?.checkForUpdates();
  };

  const handleDownloadUpdate = async () => {
    await window.electronAPI?.downloadUpdate();
  };

  const handleQuitAndInstall = async () => {
    await window.electronAPI?.quitAndInstall();
  };

  const handleToggleScheduledScan = async (enabled: boolean) => {
    if (!userIsPro) {
      addToast({
        type: 'info',
        title: 'Pro Feature',
        message: 'Scheduled scans require CachePilot Pro. Upgrade to unlock.',
      });
      return;
    }
    const api = window.electronAPI;
    if (!api) return;
    if (enabled) {
      const ok = await api.setScheduledScan(60);
      setIsTaskScheduled(ok);
      if (ok) {
        addToast({ type: 'success', title: 'Scheduled Scan', message: 'Windows Task Scheduler set (every 60 minutes)' });
      } else {
        addToast({ type: 'error', title: 'Schedule Failed', message: 'Could not create Windows scheduled task' });
      }
    } else {
      const ok = await api.cancelScheduledScan();
      setIsTaskScheduled(!ok);
      if (ok) {
        addToast({ type: 'info', title: 'Schedule Cancelled', message: 'Windows scheduled scan removed' });
      }
    }
  };

  const handleProFeatureClick = () => {
    if (!userIsPro) {
      addToast({
        type: 'info',
        title: 'Pro Feature',
        message: 'This feature requires CachePilot Pro. Upgrade to unlock.',
      });
    }
  };

  if (!settings) return null;

  const StatusIcon = UPDATE_STATUS_ICONS[updateStatus.status] || RefreshCw;
  const isUpdating = updateStatus.status === 'checking';

  return (
    <div className="flex-1 overflow-auto" style={{ background: 'rgb(15, 17, 21)' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(77, 163, 255, 0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(43, 52, 65, 0.5)',
        }}
      >
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(77, 163, 255, 0.05))',
                border: '1px solid rgba(77, 163, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SettingsIcon className="w-5 h-5" style={{ color: 'rgb(77, 163, 255)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'rgb(232, 237, 245)' }}>Settings</h1>
              <p style={{ fontSize: 13, color: 'rgb(116, 130, 148)', marginTop: 2 }}>Configure scan behavior and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scan Behavior */}
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgb(43, 52, 65)',
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgb(43, 52, 65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(77, 163, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Bell className="w-4.5 h-4.5" style={{ color: 'rgb(77, 163, 255)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Scan Behavior</h3>
                  <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>Control how CachePilot scans your PC</p>
                </div>
              </div>

              <div style={{ padding: '8px 0' }}>
                {/* Start with Windows */}
                <div
                  style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s',
                  }}
                  className="hover:bg-surface/30"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 167, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Power className="w-4 h-4" style={{ color: 'rgb(255, 167, 38)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Start with Windows</p>
                      <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 1 }}>Launch CachePilot when you log in</p>
                    </div>
                  </div>
                  <Toggle enabled={settings.autoStart} onToggle={() => update({ autoStart: !settings.autoStart })} />
                </div>

                <div style={{ height: 1, background: 'rgb(43, 52, 65)', margin: '0 24px' }} />

                {/* Auto-scan on startup */}
                <div
                  style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: userIsPro ? 1 : 0.5,
                    cursor: userIsPro ? 'default' : 'pointer',
                  }}
                  className="hover:bg-surface/30"
                  onClick={!userIsPro ? handleProFeatureClick : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56, 210, 122, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap className="w-4 h-4" style={{ color: 'rgb(56, 210, 122)' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Auto-scan on startup</p>
                        {!userIsPro && <ProBadge size="sm" />}
                      </div>
                      <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 1 }}>Automatically scan when the app launches</p>
                    </div>
                  </div>
                  <Toggle enabled={settings.autoScanOnStartup} onToggle={() => userIsPro && update({ autoScanOnStartup: !settings.autoScanOnStartup })} disabled={!userIsPro} />
                </div>

                <div style={{ height: 1, background: 'rgb(43, 52, 65)', margin: '0 24px' }} />

                {/* Background scan interval */}
                <div
                  style={{
                    padding: '14px 24px',
                    opacity: userIsPro ? 1 : 0.5,
                    cursor: userIsPro ? 'default' : 'pointer',
                  }}
                  className="hover:bg-surface/30"
                  onClick={!userIsPro ? handleProFeatureClick : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(168, 130, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock className="w-4 h-4" style={{ color: 'rgb(168, 130, 255)' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Background scan interval</p>
                          {!userIsPro && <ProBadge size="sm" />}
                        </div>
                        <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 1 }}>
                          {settings.autoScanInterval > 0
                            ? `Scans every ${settings.autoScanInterval >= 3600000 ? `${settings.autoScanInterval / 3600000}h` : `${settings.autoScanInterval / 60000}min`}`
                            : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    <select
                      value={settings.autoScanInterval}
                      onChange={(e) => userIsPro && update({ autoScanInterval: Number(e.target.value) })}
                      disabled={!userIsPro}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgb(43, 52, 65)',
                        background: 'rgb(15, 17, 21)',
                        color: 'rgb(232, 237, 245)',
                        fontSize: 13,
                        cursor: 'pointer',
                        outline: 'none',
                        minWidth: 160,
                      }}
                    >
                      {INTERVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ height: 1, background: 'rgb(43, 52, 65)', margin: '0 24px' }} />

                {/* Desktop notifications */}
                <div
                  style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  className="hover:bg-surface/30"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77, 163, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Bell className="w-4 h-4" style={{ color: 'rgb(77, 163, 255)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Desktop notifications</p>
                      <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 1 }}>Get notified when cache exceeds threshold</p>
                    </div>
                  </div>
                  <Toggle enabled={settings.showNotifications} onToggle={() => update({ showNotifications: !settings.showNotifications })} />
                </div>

                {settings.showNotifications && (
                  <>
                    <div style={{ height: 1, background: 'rgb(43, 52, 65)', margin: '0 24px' }} />
                    <div
                      style={{
                        padding: '14px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      className="hover:bg-surface/30"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 107, 107, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <HardDrive className="w-4 h-4" style={{ color: 'rgb(255, 107, 107)' }} />
                        </div>
                        <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Notify when cache exceeds</p>
                      </div>
                      <select
                        value={settings.notificationThresholdMB}
                        onChange={(e) => update({ notificationThresholdMB: Number(e.target.value) })}
                        style={{
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid rgb(43, 52, 65)',
                          background: 'rgb(15, 17, 21)',
                          color: 'rgb(232, 237, 245)',
                          fontSize: 13,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value={50}>50 MB</option>
                        <option value={100}>100 MB</option>
                        <option value={250}>250 MB</option>
                        <option value={500}>500 MB</option>
                        <option value={1024}>1 GB</option>
                      </select>
                    </div>
                  </>
                )}

                <div style={{ height: 1, background: 'rgb(43, 52, 65)', margin: '0 24px' }} />

                {/* Show safety warnings */}
                <div
                  style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  className="hover:bg-surface/30"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 167, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield className="w-4 h-4" style={{ color: 'rgb(255, 167, 38)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Show safety warnings</p>
                      <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 1 }}>Confirm before cleaning risky categories</p>
                    </div>
                  </div>
                  <Toggle enabled={settings.showSafetyWarnings} onToggle={() => update({ showSafetyWarnings: !settings.showSafetyWarnings })} />
                </div>

                <div style={{ height: 1, background: 'rgb(43, 52, 65)', margin: '0 24px' }} />

                {/* Scheduled scan */}
                <div
                  style={{
                    padding: '14px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: userIsPro ? 1 : 0.5,
                    cursor: userIsPro ? 'default' : 'pointer',
                  }}
                  className="hover:bg-surface/30"
                  onClick={!userIsPro ? handleProFeatureClick : undefined}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(77, 163, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar className="w-4 h-4" style={{ color: 'rgb(77, 163, 255)' }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 14, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>Scheduled scan</p>
                        {!userIsPro && <ProBadge size="sm" />}
                      </div>
                      <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 1 }}>
                        {isTaskScheduled ? 'Active — runs every hour via Windows Task Scheduler' : 'Runs scan automatically via Windows Task Scheduler'}
                      </p>
                    </div>
                  </div>
                  <Toggle enabled={isTaskScheduled} onToggle={() => handleToggleScheduledScan(!isTaskScheduled)} disabled={!userIsPro} />
                </div>
              </div>
            </div>

            {/* Updates */}
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgb(43, 52, 65)',
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgb(43, 52, 65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(56, 210, 122, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Download className="w-4.5 h-4.5" style={{ color: 'rgb(56, 210, 122)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Updates</h3>
                  <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>Keep CachePilot up to date</p>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <div
                  style={{
                    padding: '16px',
                    borderRadius: 12,
                    background: 'rgb(15, 17, 21)',
                    border: '1px solid rgb(43, 52, 65)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: updateStatus.status === 'downloading' ? 16 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(77, 163, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <StatusIcon className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} style={{ color: 'rgb(77, 163, 255)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: 'rgb(232, 237, 245)' }}>
                          {UPDATE_STATUS_LABELS[updateStatus.status]}
                        </p>
                        {updateStatus.version && (
                          <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginTop: 2 }}>
                            Version {updateStatus.version}
                            {updateStatus.releaseDate && ` • ${new Date(updateStatus.releaseDate).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      {updateStatus.status === 'idle' && (
                        <button
                          onClick={handleCheckUpdate}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'rgba(77, 163, 255, 0.15)',
                            color: 'rgb(77, 163, 255)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Check Now
                        </button>
                      )}
                      {updateStatus.status === 'checking' && (
                        <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>Checking...</span>
                      )}
                      {updateStatus.status === 'available' && (
                        <button
                          onClick={handleDownloadUpdate}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'rgb(77, 163, 255)',
                            color: 'white',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Download
                        </button>
                      )}
                      {updateStatus.status === 'downloading' && (
                        <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)', fontWeight: 500 }}>
                          {updateStatus.percent !== undefined ? `${Math.round(updateStatus.percent)}%` : '...'}
                        </span>
                      )}
                      {updateStatus.status === 'downloaded' && (
                        <button
                          onClick={handleQuitAndInstall}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'rgb(56, 210, 122)',
                            color: 'white',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Restart & Install
                        </button>
                      )}
                      {updateStatus.status === 'not-available' && (
                        <button
                          onClick={handleCheckUpdate}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: '1px solid rgb(43, 52, 65)',
                            background: 'transparent',
                            color: 'rgb(168, 179, 194)',
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          Recheck
                        </button>
                      )}
                      {updateStatus.status === 'error' && (
                        <button
                          onClick={handleCheckUpdate}
                          style={{
                            padding: '8px 16px',
                            borderRadius: 8,
                            border: 'none',
                            background: 'rgba(255, 107, 107, 0.15)',
                            color: 'rgb(255, 107, 107)',
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>

                  {updateStatus.status === 'downloading' && updateStatus.percent !== undefined && (
                    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgb(43, 52, 65)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: 3,
                          background: 'linear-gradient(90deg, rgb(77, 163, 255), rgb(168, 130, 255))',
                          transition: 'width 0.3s ease',
                          width: `${Math.min(updateStatus.percent, 100)}%`,
                        }}
                      />
                    </div>
                  )}

                  {updateStatus.releaseNotes && !['not-available', 'idle'].includes(updateStatus.status) && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 8,
                        background: 'rgb(21, 26, 33)',
                        border: '1px solid rgb(43, 52, 65)',
                        fontSize: 12,
                        color: 'rgb(116, 130, 148)',
                        lineHeight: 1.6,
                        maxHeight: 80,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {updateStatus.releaseNotes.replace(/<[^>]*>/g, '').trim()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* License Card */}
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgb(43, 52, 65)',
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgb(43, 52, 65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: userIsPro ? 'rgba(56, 210, 122, 0.1)' : 'rgba(168, 130, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Crown className="w-4.5 h-4.5" style={{ color: userIsPro ? 'rgb(56, 210, 122)' : 'rgb(168, 130, 255)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>License</h3>
                  <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>Manage your plan</p>
                </div>
              </div>

              <div style={{ padding: '20px 24px' }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    background: userIsPro
                      ? 'linear-gradient(135deg, rgba(56, 210, 122, 0.08), rgba(56, 210, 122, 0.02))'
                      : 'linear-gradient(135deg, rgba(168, 130, 255, 0.08), rgba(168, 130, 255, 0.02))',
                    border: userIsPro
                      ? '1px solid rgba(56, 210, 122, 0.2)'
                      : '1px solid rgba(168, 130, 255, 0.2)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Sparkles className="w-4 h-4" style={{ color: userIsPro ? 'rgb(56, 210, 122)' : 'rgb(168, 130, 255)' }} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
                        {userIsPro ? 'CachePilot Pro' : 'CachePilot Free'}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: userIsPro ? 'rgba(56, 210, 122, 0.15)' : 'rgba(116, 130, 148, 0.15)',
                        color: userIsPro ? 'rgb(56, 210, 122)' : 'rgb(116, 130, 148)',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {userIsPro ? 'ACTIVE' : 'FREE'}
                    </span>
                  </div>

                  {userIsPro && licenseStatus?.licenseKey && (
                    <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', fontFamily: 'monospace', marginBottom: 8 }}>
                      Key: {licenseStatus.licenseKey.slice(0, 8)}...
                    </p>
                  )}

                  {!userIsPro && (
                    <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginBottom: 12 }}>
                      3 scans per day • Basic features
                    </p>
                  )}

                  {userIsPro && licenseStatus?.expiresAt && (
                    <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginBottom: 12 }}>
                      Expires: {new Date(licenseStatus.expiresAt).toLocaleDateString()}
                    </p>
                  )}

                  {!userIsPro ? (
                    <button
                      onClick={() => window.electronAPI?.openExternal('https://cachepilot.gumroad.com/l/cache-pilot')}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, rgb(77, 163, 255), rgb(168, 130, 255))',
                        color: 'white',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                      }}
                    >
                      Upgrade to Pro
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        if (window.electronAPI) {
                          const result = await window.electronAPI.deactivateLicense();
                          if (result.success) {
                            setLicenseStatus({ tier: 'free', isValid: false });
                            addToast({
                              type: 'info',
                              title: 'License Deactivated',
                              message: 'CachePilot has been downgraded to Free.',
                            });
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        background: 'transparent',
                        color: 'rgb(255, 107, 107)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Deactivate License
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* About Card */}
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgb(43, 52, 65)',
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgb(43, 52, 65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(77, 163, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Info className="w-4.5 h-4.5" style={{ color: 'rgb(77, 163, 255)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>About</h3>
                  <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>App information</p>
                </div>
              </div>

              <div style={{ padding: '16px 24px' }}>
                {appInfo && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { icon: Zap, label: 'Version', value: appInfo.version, color: 'rgb(56, 210, 122)' },
                      { icon: Cpu, label: 'Platform', value: `${appInfo.platform} (${appInfo.arch})`, color: 'rgb(168, 130, 255)' },
                      { icon: Globe, label: 'Electron', value: appInfo.electronVersion, color: 'rgb(77, 163, 255)' },
                      { icon: Globe, label: 'Chrome', value: appInfo.chromeVersion, color: 'rgb(255, 167, 38)' },
                    ].map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <item.icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                          <span style={{ fontSize: 13, color: 'rgb(168, 179, 194)' }}>{item.label}</span>
                        </div>
                        <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)', fontFamily: 'monospace' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgb(43, 52, 65)',
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgb(43, 52, 65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(255, 167, 38, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FolderOpen className="w-4.5 h-4.5" style={{ color: 'rgb(255, 167, 38)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Quick Actions</h3>
                  <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>Troubleshooting</p>
                </div>
              </div>

              <div style={{ padding: '12px 24px' }}>
                <button
                  onClick={() => window.electronAPI?.openLogsFolder()}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid rgb(43, 52, 65)',
                    background: 'rgb(15, 17, 21)',
                    color: 'rgb(232, 237, 245)',
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(77, 163, 255)';
                    e.currentTarget.style.background = 'rgba(77, 163, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgb(43, 52, 65)';
                    e.currentTarget.style.background = 'rgb(15, 17, 21)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FolderOpen className="w-4 h-4" style={{ color: 'rgb(116, 130, 148)' }} />
                    <span>Open Logs Folder</span>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: 'rgb(116, 130, 148)' }} />
                </button>
              </div>
            </div>

            {/* Privacy Notice */}
            <div
              style={{
                borderRadius: 16,
                border: '1px solid rgba(56, 210, 122, 0.2)',
                background: 'linear-gradient(135deg, rgba(56, 210, 122, 0.05), rgba(56, 210, 122, 0.02))',
                padding: '16px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <Shield className="w-4 h-4 mt-0.5" style={{ color: 'rgb(56, 210, 122)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'rgb(56, 210, 122)', marginBottom: 4 }}>
                    Local & Private
                  </p>
                  <p style={{ fontSize: 12, color: 'rgb(116, 130, 148)', lineHeight: 1.5 }}>
                    All scan data stays on your PC. Nothing is sent to the internet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
