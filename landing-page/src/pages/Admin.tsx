import { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { fetchFeedback, type FeedbackItem } from '../api/dashboard';
import { Shield, Download, Users, Activity, AlertTriangle, RefreshCw, BarChart3, Cpu, Globe, MessageSquare } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
      border: '1px solid rgb(43, 52, 65)',
      borderRadius: 16,
      padding: '20px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'rgb(232, 237, 245)' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

function MiniBarChart({ data, max }: { data: { date: string; count: number }[]; max: number }) {
  const maxVal = max || Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: '100%',
            height: `${Math.max((d.count / maxVal) * 100, 2)}%`,
            background: 'linear-gradient(180deg, rgb(77, 163, 255), rgb(37, 99, 235))',
            borderRadius: 3,
            minHeight: 2,
          }} />
        </div>
      ))}
    </div>
  );
}

function PieLegend({ items }: { items: { label: string; count: number; percentage: number; color: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'rgb(168, 179, 194)', flex: 1 }}>{item.label}</span>
          <span style={{ fontSize: 12, color: 'rgb(116, 130, 148)' }}>{item.count}</span>
          <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)' }}>({item.percentage.toFixed(1)}%)</span>
        </div>
      ))}
    </div>
  );
}

const VERSION_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const CATEGORY_BADGES: Record<string, { color: string; bg: string }> = {
  bug: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
  feature: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  improvement: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  other: { color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
};

export function Admin() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('cp_admin_key') || '');
  const [inputKey, setInputKey] = useState(apiKey);
  const [range, setRange] = useState('7d');
  const { data, loading, error, refresh } = useDashboard(apiKey || null, range);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const loadFeedback = useCallback(async () => {
    if (!apiKey) return;
    setFeedbackLoading(true);
    try {
      const items = await fetchFeedback(apiKey);
      setFeedbacks(items);
    } catch {
      // silently fail — feedback is non-critical
    } finally {
      setFeedbackLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    loadFeedback();
    const interval = setInterval(loadFeedback, 30000);
    return () => clearInterval(interval);
  }, [loadFeedback]);

  const handleLogin = () => {
    localStorage.setItem('cp_admin_key', inputKey);
    setApiKey(inputKey);
  };

  if (!apiKey) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'rgb(15, 17, 21)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
          border: '1px solid rgb(43, 52, 65)',
          borderRadius: 20,
          padding: 48,
          width: 400,
          textAlign: 'center',
        }}>
          <Shield size={48} style={{ color: 'rgb(77, 163, 255)', marginBottom: 20 }} />
          <h1 style={{ color: 'rgb(232, 237, 245)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            CachePilot Admin
          </h1>
          <p style={{ color: 'rgb(116, 130, 148)', fontSize: 14, marginBottom: 24 }}>
            Enter your API key to access the dashboard
          </p>
          <input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="API Key"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: '1px solid rgb(43, 52, 65)',
              background: 'rgb(15, 17, 21)',
              color: 'rgb(232, 237, 245)',
              fontSize: 14,
              outline: 'none',
              marginBottom: 16,
            }}
          />
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'rgb(77, 163, 255)',
              color: 'white',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Access Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgb(15, 17, 21)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: 32,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ color: 'rgb(232, 237, 245)', fontSize: 24, fontWeight: 700, margin: 0 }}>
              CachePilot Dashboard
            </h1>
            <p style={{ color: 'rgb(116, 130, 148)', fontSize: 13, margin: '4px 0 0 0' }}>
              Real-time telemetry overview
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgb(43, 52, 65)',
                background: 'rgb(21, 26, 33)',
                color: 'rgb(232, 237, 245)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button
              onClick={() => { refresh(); loadFeedback(); }}
              disabled={loading}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgb(43, 52, 65)',
                background: 'rgb(21, 26, 33)',
                color: 'rgb(168, 179, 194)',
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => { localStorage.removeItem('cp_admin_key'); setApiKey(''); }}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid rgb(43, 52, 65)',
                background: 'transparent',
                color: 'rgb(116, 130, 148)',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
            color: 'rgb(252, 165, 165)',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard icon={Users} label="Live Users (24h)" value={data.live_users} color="#3b82f6" />
              <StatCard icon={Download} label="Total Installs" value={data.total_installs} color="#10b981" />
              <StatCard icon={Activity} label="Daily Active" value={data.dau} color="#8b5cf6" />
              <StatCard icon={AlertTriangle} label="Crash Rate" value={`${data.crash_rate}%`} color="#ef4444" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                border: '1px solid rgb(43, 52, 65)',
                borderRadius: 16,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <BarChart3 size={18} style={{ color: 'rgb(77, 163, 255)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Daily Installs</span>
                </div>
                <MiniBarChart data={data.daily_installs} max={0} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgb(116, 130, 148)' }}>
                    {data.daily_installs[0]?.date || ''}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgb(116, 130, 148)' }}>
                    {data.daily_installs[data.daily_installs.length - 1]?.date || ''}
                  </span>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                border: '1px solid rgb(43, 52, 65)',
                borderRadius: 16,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Activity size={18} style={{ color: 'rgb(139, 92, 246)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Daily Active Users</span>
                </div>
                <MiniBarChart data={data.daily_active} max={0} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 10, color: 'rgb(116, 130, 148)' }}>
                    {data.daily_active[0]?.date || ''}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgb(116, 130, 148)' }}>
                    {data.daily_active[data.daily_active.length - 1]?.date || ''}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                border: '1px solid rgb(43, 52, 65)',
                borderRadius: 16,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Cpu size={18} style={{ color: 'rgb(6, 182, 212)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Version Distribution</span>
                </div>
                <PieLegend items={data.version_distribution.slice(0, 6).map((v, i) => ({
                  label: `v${v.version}`,
                  count: v.count,
                  percentage: v.percentage,
                  color: VERSION_COLORS[i % VERSION_COLORS.length],
                }))} />
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                border: '1px solid rgb(43, 52, 65)',
                borderRadius: 16,
                padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Globe size={18} style={{ color: 'rgb(245, 158, 11)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>OS Distribution</span>
                </div>
                <PieLegend items={data.os_distribution.slice(0, 6).map((o, i) => ({
                  label: o.os,
                  count: o.count,
                  percentage: o.percentage,
                  color: VERSION_COLORS[i % VERSION_COLORS.length],
                }))} />
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
              border: '1px solid rgb(43, 52, 65)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <BarChart3 size={18} style={{ color: 'rgb(16, 185, 129)' }} />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Cleanup Statistics</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'rgb(232, 237, 245)' }}>
                    {data.cleanup_stats.total_scans.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>Total Scans</div>
                </div>
                <div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'rgb(232, 237, 245)' }}>
                    {data.cleanup_stats.total_cleanups.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, color: 'rgb(116, 130, 148)' }}>Total Cleanups</div>
                </div>
              </div>
            </div>

            {data.recent_crashes.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
                border: '1px solid rgb(43, 52, 65)',
                borderRadius: 16,
                overflow: 'hidden',
                marginBottom: 24,
              }}>
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid rgb(43, 52, 65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <AlertTriangle size={18} style={{ color: 'rgb(239, 68, 68)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>Recent Crashes</span>
                </div>
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {data.recent_crashes.map((crash, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '12px 24px',
                        borderBottom: '1px solid rgb(43, 52, 65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 13, color: 'rgb(232, 237, 245)' }}>
                          {String(crash.crash_type)} crash
                        </span>
                        <span style={{ fontSize: 12, color: 'rgb(116, 130, 148)', marginLeft: 12 }}>
                          v{String(crash.app_version)}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)' }}>
                        {String(crash.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: 'linear-gradient(135deg, rgb(21, 26, 33) 0%, rgb(18, 22, 28) 100%)',
              border: '1px solid rgb(43, 52, 65)',
              borderRadius: 16,
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgb(43, 52, 65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageSquare size={18} style={{ color: 'rgb(168, 130, 255)' }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'rgb(232, 237, 245)' }}>
                    User Feedback
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: 'rgb(116, 130, 148)',
                    background: 'rgb(15, 17, 21)',
                    padding: '2px 8px',
                    borderRadius: 6,
                  }}>
                    {feedbacks.length}
                  </span>
                </div>
                <button
                  onClick={loadFeedback}
                  disabled={feedbackLoading}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: '1px solid rgb(43, 52, 65)',
                    background: 'rgb(15, 17, 21)',
                    color: 'rgb(116, 130, 148)',
                    fontSize: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <RefreshCw size={12} className={feedbackLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
              {feedbacks.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'rgb(116, 130, 148)', fontSize: 13 }}>
                  {feedbackLoading ? 'Loading feedback...' : 'No feedback yet'}
                </div>
              ) : (
                <div style={{ maxHeight: 400, overflow: 'auto' }}>
                  {feedbacks.map((fb) => {
                    const badge = CATEGORY_BADGES[fb.category] || CATEGORY_BADGES.other;
                    return (
                      <div
                        key={fb.id}
                        style={{
                          padding: '14px 24px',
                          borderBottom: '1px solid rgb(43, 52, 65)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: badge.color,
                            background: badge.bg,
                            padding: '2px 8px',
                            borderRadius: 6,
                            textTransform: 'capitalize',
                          }}>
                            {fb.category}
                          </span>
                          {fb.name && (
                            <span style={{ fontSize: 12, color: 'rgb(232, 237, 245)', fontWeight: 500 }}>
                              {fb.name}
                            </span>
                          )}
                          {fb.email && (
                            <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)' }}>
                              {fb.email}
                            </span>
                          )}
                          <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)', marginLeft: 'auto' }}>
                            {fb.created_at?.slice(0, 16).replace('T', ' ')}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'rgb(190, 200, 215)', margin: 0, lineHeight: 1.5 }}>
                          {fb.message}
                        </p>
                        {(fb.app_version || fb.os_version) && (
                          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                            {fb.app_version && (
                              <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)' }}>v{fb.app_version}</span>
                            )}
                            {fb.os_version && (
                              <span style={{ fontSize: 11, color: 'rgb(116, 130, 148)' }}>{fb.os_version}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: 48, color: 'rgb(116, 130, 148)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ marginBottom: 12 }} />
            <div>Loading dashboard data...</div>
          </div>
        )}
      </div>
    </div>
  );
}
