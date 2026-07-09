// Solo Empire Cloud Monitor - Uptime Monitoring Worker
// Runs on Cloudflare Workers free tier (100K requests/day)
// Checks health of services every 5 minutes via Cron Trigger

export interface Env {
  MONITOR_KV: KVNamespace;
}

interface MonitorResult {
  url: string;
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency: number;
  timestamp: string;
  error?: string;
}

// Services to monitor
const SERVICES = [
  { name: 'Solo Empire API', url: 'https://api.solo-empire.workers.dev/health' },
  { name: 'BookDev', url: 'https://bookdev.page' },
  { name: 'BookMoney', url: 'https://bookmoney.page' },
  { name: 'BookLife', url: 'https://booklife.page' },
  { name: 'BookMarketing', url: 'https://bookmarketing.page' },
  { name: 'BookProduct', url: 'https://bookproduct.page' },
  { name: 'BookOps', url: 'https://bookops.page' },
];

export default {
  // HTTP handler - view status
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/status') {
      return handleStatus(env);
    }
    
    if (url.pathname === '/check') {
      return handleManualCheck(env);
    }
    
    return new Response(`
<!DOCTYPE html>
<html>
<head>
  <title>Solo Empire Monitor</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .service { padding: 15px; margin: 10px 0; border-radius: 8px; }
    .up { background: #d4edda; border-left: 4px solid #28a745; }
    .down { background: #f8d7da; border-left: 4px solid #dc3545; }
    .degraded { background: #fff3cd; border-left: 4px solid #ffc107; }
    .unknown { background: #e2e3e5; border-left: 4px solid #6c757d; }
    .latency { color: #666; font-size: 0.9em; }
    h1 { color: #333; }
    .last-check { color: #666; font-size: 0.85em; }
  </style>
</head>
<body>
  <h1>Solo Empire Status</h1>
  <p class="last-check">Loading...</p>
  <div id="services"></div>
  <script>
    fetch('/status')
      .then(r => r.json())
      .then(data => {
        document.querySelector('.last-check').textContent = 
          'Last check: ' + new Date(data.timestamp).toLocaleString();
        document.getElementById('services').innerHTML = data.results.map(s => 
          '<div class="service ' + s.status + '">' +
          '<strong>' + s.name + '</strong><br>' +
          '<span class="latency">' + s.latency + 'ms</span>' +
          (s.error ? '<br><small>' + s.error + '</small>' : '') +
          '</div>'
        ).join('');
      });
  </script>
</body>
</html>
    `, { headers: { 'Content-Type': 'text/html' } });
  },

  // Cron handler - runs every 5 minutes
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(runChecks(env));
  },
};

async function handleStatus(env: Env): Promise<Response> {
  const data = await env.MONITOR_KV.get('latest-status', 'json');
  if (!data) {
    return Response.json({ results: [], timestamp: new Date().toISOString(), message: 'No checks yet' });
  }
  return Response.json(data);
}

async function handleManualCheck(env: Env): Promise<Response> {
  const results = await runChecks(env);
  return Response.json(results);
}

async function runChecks(env: Env): Promise<{ results: MonitorResult[]; timestamp: string }> {
  const results: MonitorResult[] = [];
  
  for (const service of SERVICES) {
    const result = await checkService(service);
    results.push(result);
  }
  
  const status = { results, timestamp: new Date().toISOString() };
  
  // Store in KV (expires in 24 hours)
  await env.MONITOR_KV.put('latest-status', JSON.stringify(status), { expirationTtl: 86400 });
  
  // Store history (last 100 checks)
  const historyKey = `history:${Date.now()}`;
  await env.MONITOR_KV.put(historyKey, JSON.stringify(status), { expirationTtl: 604800 });
  
  return status;
}

async function checkService(service: { name: string; url: string }): Promise<MonitorResult> {
  const start = Date.now();
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(service.url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'SoloEmpireMonitor/1.0' },
    });
    
    clearTimeout(timeout);
    const latency = Date.now() - start;
    
    if (response.ok) {
      return { url: service.url, name: service.name, status: 'up', latency, timestamp: new Date().toISOString() };
    } else if (response.status >= 500) {
      return { url: service.url, name: service.name, status: 'down', latency, timestamp: new Date().toISOString(), error: `HTTP ${response.status}` };
    } else {
      return { url: service.url, name: service.name, status: 'degraded', latency, timestamp: new Date().toISOString(), error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      url: service.url, 
      name: service.name, 
      status: 'down', 
      latency: Date.now() - start, 
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
