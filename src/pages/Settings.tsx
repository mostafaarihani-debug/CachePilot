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
} from 'lucide-react';
import type { AppSettings, AppInfo, UpdateStatus } from '../types';
import { useToastStore } from '../store/toastStore';

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

function formatInterval(ms: number): string {
  if (ms === 0) return 'Off';
  if (ms <= 60 * 60 * 1000) return `${ms / (60 * 1000)} min`;
  if (ms < 24 * 60 * 60 * 1000) return `${ms / (60 * 60 * 1000)} hours`;
  return 'Daily';
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${
        enabled ? 'bg-primary' : 'bg-surface-3'
      }`}
      onClick={onToggle}
    >
      <div
        className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
          enabled ? 'translate-x-5' : 'translate-x-1'
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

  if (!settings) return null;

  const StatusIcon = UPDATE_STATUS_ICONS[updateStatus.status] || RefreshCw;
  const isUpdating = updateStatus.status === 'checking' || updateStatus.status === 'downloading';

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-txt tracking-tight">Settings</h1>
          <p className="text-txt-secondary mt-1">Configure scan behavior and preferences</p>
        </div>

        {/* Scan Behavior */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-txt mb-1">Scan Behavior</h3>
              <p className="text-sm text-txt-secondary mb-4">
                Control how CachePilot scans your PC
              </p>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex items-center gap-3">
                    <Power className="w-4 h-4 text-txt-muted" />
                    <div>
                      <span className="text-sm text-txt block">Start with Windows</span>
                      <span className="text-xs text-txt-muted">Launch CachePilot when you log in</span>
                    </div>
                  </div>
                  <Toggle enabled={settings.autoStart} onToggle={() => update({ autoStart: !settings.autoStart })} />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-txt-muted" />
                    <span className="text-sm text-txt">Auto-scan on startup</span>
                  </div>
                  <Toggle
                    enabled={settings.autoScanOnStartup}
                    onToggle={() => update({ autoScanOnStartup: !settings.autoScanOnStartup })}
                  />
                </label>

                <div className="p-3 rounded-lg bg-surface">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-txt-muted" />
                      <span className="text-sm text-txt">Background scan interval</span>
                    </div>
                    <select
                      value={settings.autoScanInterval}
                      onChange={(e) => update({ autoScanInterval: Number(e.target.value) })}
                      className="bg-surface-2 border border-bdr rounded-lg px-3 py-1.5 text-sm text-txt cursor-pointer outline-none focus:border-primary"
                    >
                      {INTERVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {settings.autoScanInterval > 0 && (
                    <p className="text-xs text-txt-muted mt-2 ml-7">
                      CachePilot will scan in the background {formatInterval(settings.autoScanInterval).toLowerCase()} and notify you if significant cache is found.
                    </p>
                  )}
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-txt-muted" />
                    <div>
                      <span className="text-sm text-txt block">Desktop notifications</span>
                      <span className="text-xs text-txt-muted">Get notified when cache exceeds threshold</span>
                    </div>
                  </div>
                  <Toggle
                    enabled={settings.showNotifications}
                    onToggle={() => update({ showNotifications: !settings.showNotifications })}
                  />
                </label>

                {settings.showNotifications && (
                  <div className="p-3 rounded-lg bg-surface">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-4 h-4 text-txt-muted" />
                        <span className="text-sm text-txt">Notify when cache exceeds</span>
                      </div>
                      <select
                        value={settings.notificationThresholdMB}
                        onChange={(e) => update({ notificationThresholdMB: Number(e.target.value) })}
                        className="bg-surface-2 border border-bdr rounded-lg px-3 py-1.5 text-sm text-txt cursor-pointer outline-none focus:border-primary"
                      >
                        <option value={50}>50 MB</option>
                        <option value={100}>100 MB</option>
                        <option value={250}>250 MB</option>
                        <option value={500}>500 MB</option>
                        <option value={1024}>1 GB</option>
                      </select>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-txt-muted" />
                    <span className="text-sm text-txt">Show safety warnings</span>
                  </div>
                  <Toggle
                    enabled={settings.showSafetyWarnings}
                    onToggle={() => update({ showSafetyWarnings: !settings.showSafetyWarnings })}
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg bg-surface">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-txt-muted" />
                    <div>
                      <span className="text-sm text-txt block">Scheduled scan (Windows Task Scheduler)</span>
                      <span className="text-xs text-txt-muted">Runs scan every hour via Windows Task Scheduler</span>
                    </div>
                  </div>
                  <Toggle
                    enabled={isTaskScheduled}
                    onToggle={() => handleToggleScheduledScan(!isTaskScheduled)}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-txt mb-1">Updates</h3>
              <p className="text-sm text-txt-secondary mb-4">
                Keep CachePilot up to date
              </p>

              <div className="p-3 rounded-lg bg-surface">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-4 h-4 text-txt-muted ${isUpdating ? 'animate-spin' : ''}`} />
                    <div>
                      <span className="text-sm text-txt block">
                        {UPDATE_STATUS_LABELS[updateStatus.status]}
                      </span>
                      {updateStatus.version && (
                        <span className="text-xs text-txt-muted">
                          Version {updateStatus.version}
                          {updateStatus.releaseDate && ` (${new Date(updateStatus.releaseDate).toLocaleDateString()})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {updateStatus.status === 'idle' && (
                      <button
                        onClick={handleCheckUpdate}
                        className="px-3 py-1.5 text-xs font-medium bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                      >
                        Check Now
                      </button>
                    )}
                    {updateStatus.status === 'checking' && (
                      <span className="px-3 py-1.5 text-xs text-txt-muted">Checking...</span>
                    )}
                    {updateStatus.status === 'available' && (
                      <button
                        onClick={handleDownloadUpdate}
                        className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Download
                      </button>
                    )}
                    {updateStatus.status === 'downloading' && (
                      <span className="px-3 py-1.5 text-xs text-txt-muted">
                        {updateStatus.percent !== undefined ? `${Math.round(updateStatus.percent)}%` : 'Downloading...'}
                      </span>
                    )}
                    {updateStatus.status === 'downloaded' && (
                      <button
                        onClick={handleQuitAndInstall}
                        className="px-3 py-1.5 text-xs font-medium bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                      >
                        Restart & Install
                      </button>
                    )}
                    {updateStatus.status === 'not-available' && (
                      <button
                        onClick={handleCheckUpdate}
                        className="px-3 py-1.5 text-xs font-medium bg-surface-3 text-txt rounded-lg hover:bg-surface-2 transition-colors"
                      >
                        Recheck
                      </button>
                    )}
                    {updateStatus.status === 'error' && (
                      <button
                        onClick={handleCheckUpdate}
                        className="px-3 py-1.5 text-xs font-medium bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                </div>

                {updateStatus.status === 'downloading' && updateStatus.percent !== undefined && (
                  <div className="w-full bg-surface-3 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(updateStatus.percent, 100)}%` }}
                    />
                  </div>
                )}

                {updateStatus.releaseNotes && updateStatus.status !== 'not-available' && (
                  <div className="mt-3 p-2 rounded bg-surface-2 text-xs text-txt-muted whitespace-pre-wrap max-h-24 overflow-auto">
                    {updateStatus.releaseNotes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-txt mb-1">About CachePilot</h3>
              <p className="text-sm text-txt-secondary mb-4">
                App information and system details
              </p>

              <div className="p-3 rounded-lg bg-surface space-y-3">
                {appInfo && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap className="w-4 h-4 text-txt-muted" />
                        <span className="text-sm text-txt">Version</span>
                      </div>
                      <span className="text-sm text-txt-muted font-mono">{appInfo.version}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-4 h-4 text-txt-muted" />
                        <span className="text-sm text-txt">Platform</span>
                      </div>
                      <span className="text-sm text-txt-muted capitalize">{appInfo.platform} ({appInfo.arch})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-txt-muted" />
                        <span className="text-sm text-txt">Electron</span>
                      </div>
                      <span className="text-sm text-txt-muted font-mono">{appInfo.electronVersion}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-txt-muted" />
                        <span className="text-sm text-txt">Chrome</span>
                      </div>
                      <span className="text-sm text-txt-muted font-mono">{appInfo.chromeVersion}</span>
                    </div>
                  </>
                )}

                <div className="pt-2 border-t border-bdr">
                  <p className="text-xs text-txt-muted">
                    CachePilot stores all data locally on your PC. Nothing is sent to the internet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="card">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-success" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-txt mb-1">Data & Privacy</h3>
              <p className="text-sm text-txt-secondary mb-4">
                All data stays on your device
              </p>

              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm text-success">
                  CachePilot stores all scan data locally on your PC. Nothing is sent to the internet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
