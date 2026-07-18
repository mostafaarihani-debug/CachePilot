const API_BASE = 'https://cachepilot-api.admorandom.workers.dev';

export interface DashboardData {
  live_users: number;
  total_installs: number;
  dau: number;
  crash_rate: number;
  version_distribution: { version: string; count: number; percentage: number }[];
  os_distribution: { os: string; count: number; percentage: number }[];
  daily_installs: { date: string; count: number }[];
  daily_active: { date: string; count: number }[];
  recent_crashes: Record<string, unknown>[];
  cleanup_stats: {
    total_scans: number;
    total_cleanups: number;
  };
}

export async function fetchDashboard(apiKey: string, range = '7d'): Promise<DashboardData> {
  const response = await fetch(`${API_BASE}/api/v1/dashboard?range=${range}`, {
    headers: { 'X-API-Key': apiKey },
  });
  
  if (!response.ok) {
    throw new Error(`Dashboard fetch failed: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchStats(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE}/api/v1/stats`);
  return response.json();
}

export interface FeedbackItem {
  id: number;
  name: string | null;
  email: string | null;
  category: string;
  message: string;
  app_version: string | null;
  os_version: string | null;
  created_at: string;
}

export async function fetchFeedback(apiKey: string): Promise<FeedbackItem[]> {
  const response = await fetch(`${API_BASE}/api/v1/feedback`, {
    headers: { 'X-API-Key': apiKey },
  });
  
  if (!response.ok) {
    throw new Error(`Feedback fetch failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data.feedbacks || [];
}
