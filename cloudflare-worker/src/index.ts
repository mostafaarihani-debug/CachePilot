export interface Env {
  DB: D1Database;
  API_KEY: string;
}

interface EventBody {
  events: Record<string, unknown>[];
}

interface CrashBody {
  event: string;
  device_id: string;
  timestamp: string;
  app_version: string;
  os_version: string;
  os_build: string;
  arch: string;
  screen_width: number;
  screen_height: number;
  language: string;
  timezone: string;
  properties?: Record<string, unknown>;
}

interface UninstallBody {
  device_id: string;
  app_version: string;
  total_sessions: number;
  last_active: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function validateEvent(event: Record<string, unknown>): boolean {
  if (!event.event || !event.device_id || !event.timestamp) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(event.device_id as string)) return false;
  if (!/^\d+\.\d+\.\d+$/.test(event.app_version as string)) return false;
  return true;
}

async function checkRateLimit(db: D1Database, deviceId: string): Promise<boolean> {
  const hour = new Date().toISOString().slice(0, 13);
  const result = await db.prepare(
    'SELECT request_count as count FROM rate_limits WHERE device_id = ? AND hour = ?'
  ).bind(deviceId, hour).first<{ count: number }>();
  
  const count = result?.count ?? 0;
  if (count >= 100) return false;
  
  await db.prepare(
    'INSERT INTO rate_limits (device_id, hour, request_count) VALUES (?, ?, 1) '
    + 'ON CONFLICT (device_id, hour) DO UPDATE SET request_count = request_count + 1'
  ).bind(deviceId, hour).run();
  
  return true;
}

async function upsertDevice(db: D1Database, event: Record<string, unknown>): Promise<void> {
  const deviceId = event.device_id as string;
  const timestamp = event.timestamp as string;
  
  const existing = await db.prepare(
    'SELECT device_id FROM devices WHERE device_id = ?'
  ).bind(deviceId).first();
  
  if (existing) {
    await db.prepare(
      'UPDATE devices SET last_seen = ?, app_version = ?, is_active = 1, updated_at = datetime(\'now\') '
      + 'WHERE device_id = ?'
    ).bind(timestamp, event.app_version as string, deviceId).run();
  } else {
    await db.prepare(
      'INSERT INTO devices (device_id, first_seen, last_seen, app_version, os_version, os_build, arch, language, timezone) '
      + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      deviceId,
      timestamp,
      timestamp,
      event.app_version as string,
      event.os_version as string,
      event.os_build as string,
      event.arch as string,
      event.language as string,
      event.timezone as string,
    ).run();
  }
}

async function updateDailyStats(db: D1Database, event: Record<string, unknown>): Promise<void> {
  const date = (event.timestamp as string).slice(0, 10);
  const eventName = event.event as string;
  const version = event.app_version as string;
  
  const metrics: Record<string, string> = {
    'launch': 'dau',
    'install': 'installs',
    'scan_completed': 'scans',
    'cleanup_completed': 'cleanups',
    'heartbeat': 'heartbeats',
  };
  
  const metric = metrics[eventName];
  if (metric) {
    await db.prepare(
      'INSERT INTO daily_stats (date, metric, value, dimension) VALUES (?, ?, 1, ?) '
      + 'ON CONFLICT (date, metric, dimension) DO UPDATE SET value = value + 1'
    ).bind(date, metric, version).run();
  }
}

async function handleEvents(request: Request, env: Env): Promise<Response> {
  const body = await request.json<EventBody>();
  
  if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
    return json({ error: 'Invalid request: events array required' }, 400);
  }
  
  if (body.events.length > 50) {
    return json({ error: 'Max 50 events per request' }, 400);
  }
  
  let accepted = 0;
  let failed = 0;
  
  for (const event of body.events) {
    if (!validateEvent(event)) {
      failed++;
      continue;
    }
    
    const deviceId = event.device_id as string;
    if (!await checkRateLimit(env.DB, deviceId)) {
      failed++;
      continue;
    }
    
    try {
      await env.DB.prepare(
        'INSERT INTO events (event, device_id, timestamp, app_version, os_version, os_build, arch, '
        + 'screen_width, screen_height, language, timezone, properties) '
        + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(
        event.event as string,
        deviceId,
        event.timestamp as string,
        event.app_version as string,
        event.os_version as string,
        event.os_build as string,
        event.arch as string,
        event.screen_width as number,
        event.screen_height as number,
        event.language as string,
        event.timezone as string,
        event.properties ? JSON.stringify(event.properties) : null,
      ).run();
      
      await upsertDevice(env.DB, event);
      await updateDailyStats(env.DB, event);
      accepted++;
    } catch {
      failed++;
    }
  }
  
  return json({ ok: true, accepted, failed });
}

async function handleCrash(request: Request, env: Env): Promise<Response> {
  const body = await request.json<CrashBody>();
  
  if (!body.device_id || !body.crash_type || !body.error_message) {
    return json({ error: 'Invalid crash report' }, 400);
  }
  
  if (!await checkRateLimit(env.DB, body.device_id)) {
    return json({ error: 'Rate limited' }, 429);
  }
  
  await env.DB.prepare(
    'INSERT INTO crashes (device_id, timestamp, app_version, os_version, crash_type, '
    + 'error_message, stack_trace, memory_usage_mb, active_page) '
    + 'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(
    body.device_id,
    body.timestamp,
    body.app_version,
    body.os_version,
    body.crash_type,
    body.error_message,
    body.stack_trace || null,
    body.memory_usage_mb || null,
    body.active_page || null,
  ).run();
  
  return json({ ok: true });
}

async function handleUninstall(request: Request, env: Env): Promise<Response> {
  const body = await request.json<UninstallBody>();
  
  if (!body.device_id) {
    return json({ error: 'device_id required' }, 400);
  }
  
  await env.DB.prepare(
    'UPDATE devices SET is_active = 0, last_seen = ?, updated_at = datetime(\'now\') WHERE device_id = ?'
  ).bind(body.last_active || new Date().toISOString(), body.device_id).run();
  
  return json({ ok: true });
}

async function handleDashboard(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const range = url.searchParams.get('range') || '7d';
  const days = parseInt(range) || 7;
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  
  const db = env.DB;
  
  const [active24h, totalDevices, dauData, installs, scans, cleanups, crashes, versions, osDist, recentCrashes, dailyInstalls, dailyActive] = await Promise.all([
    db.prepare('SELECT COUNT(DISTINCT device_id) as count FROM events WHERE timestamp > datetime(\'now\', \'-1 day\')').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM devices').first<{ count: number }>(),
    db.prepare('SELECT COUNT(DISTINCT device_id) as count FROM events WHERE event = \'launch\' AND timestamp > datetime(\'now\', \'-1 day\')').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM events WHERE event = \'install\'').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM events WHERE event = \'scan_completed\'').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM events WHERE event = \'cleanup_completed\'').first<{ count: number }>(),
    db.prepare('SELECT COUNT(*) as count FROM crashes').first<{ count: number }>(),
    db.prepare('SELECT app_version, COUNT(*) as count FROM devices GROUP BY app_version ORDER BY count DESC').all<{ app_version: string; count: number }>(),
    db.prepare('SELECT os_version, COUNT(*) as count FROM devices GROUP BY os_version ORDER BY count DESC').all<{ os_version: string; count: number }>(),
    db.prepare('SELECT * FROM crashes ORDER BY created_at DESC LIMIT 10').all<Record<string, unknown>>(),
    db.prepare('SELECT date, SUM(value) as count FROM daily_stats WHERE metric = \'installs\' AND date >= ? GROUP BY date ORDER BY date').bind(since).all<{ date: string; count: number }>(),
    db.prepare('SELECT date, COUNT(DISTINCT device_id) as count FROM events WHERE event = \'launch\' AND date >= ? GROUP BY date ORDER BY date').bind(since).all<{ date: string; count: number }>(),
  ]);
  
  const totalInstalls = totalDevices?.count ?? 0;
  const dau = dauData?.count ?? 0;
  const crashRate = totalInstalls > 0 ? ((crashes?.count ?? 0) / totalInstalls * 100) : 0;
  
  const versionDist = (versions?.results ?? []).map(v => ({
    version: v.app_version,
    count: v.count,
    percentage: totalInstalls > 0 ? (v.count / totalInstalls * 100) : 0,
  }));
  
  const osDistribution = (osDist?.results ?? []).map(o => ({
    os: o.os_version,
    count: o.count,
    percentage: totalInstalls > 0 ? (o.count / totalInstalls * 100) : 0,
  }));
  
  return json({
    live_users: active24h?.count ?? 0,
    total_installs: totalInstalls,
    dau,
    crash_rate: Math.round(crashRate * 100) / 100,
    version_distribution: versionDist,
    os_distribution: osDistribution,
    daily_installs: dailyInstalls?.results ?? [],
    daily_active: dailyActive?.results ?? [],
    recent_crashes: recentCrashes?.results ?? [],
    cleanup_stats: {
      total_scans: scans?.count ?? 0,
      total_cleanups: cleanups?.count ?? 0,
    },
  });
}

async function handleStats(): Promise<Response> {
  return json({
    status: 'ok',
    message: 'CachePilot Telemetry API',
    version: '1.0.0',
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    try {
      if (path === '/api/v1/events' && request.method === 'POST') {
        return await handleEvents(request, env);
      }
      
      if (path === '/api/v1/crash' && request.method === 'POST') {
        return await handleCrash(request, env);
      }
      
      if (path === '/api/v1/uninstall' && request.method === 'POST') {
        return await handleUninstall(request, env);
      }
      
      if (path === '/api/v1/dashboard' && request.method === 'GET') {
        const apiKey = request.headers.get('X-API-Key');
        if (apiKey !== env.API_KEY) {
          return json({ error: 'Unauthorized' }, 401);
        }
        return await handleDashboard(request, env);
      }
      
      if (path === '/api/v1/stats' && request.method === 'GET') {
        return await handleStats();
      }
      
      if (path === '/api/v1/health' && request.method === 'GET') {
        return json({ status: 'ok' });
      }
      
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json({ error: 'Internal server error' }, 500);
    }
  },
};
