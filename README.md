# Solo Empire Cloud Monitor

Cloudflare Worker that monitors your services 24/7 on the **free tier**.

## Features

- Checks 7 domains every 5 minutes via Cron Trigger
- Stores status in KV (last 24 hours)
- Web UI at `https://solo-empire-monitor.<your-subdomain>.workers.dev`
- API endpoints: `/status` (JSON), `/check` (manual trigger)
- Zero cost — runs entirely on Cloudflare's free tier (100K requests/day)

## Services Monitored

| Name | URL |
|------|-----|
| Solo Empire API | https://api.solo-empire.workers.dev/health |
| BookDev | https://bookdev.page |
| BookMoney | https://bookmoney.page |
| BookLife | https://booklife.page |
| BookMarketing | https://bookmarketing.page |
| BookProduct | https://bookproduct.page |
| BookOps | https://bookops.page |

## Setup (After Re-authenticating Cloudflare)

1. **Re-authenticate Wrangler:**
   ```bash
   npx wrangler login
   ```

2. **Create KV namespace:**
   ```bash
   cd infra/cloud-monitor
   npx wrangler kv:namespace create MONITOR_KV
   ```

3. **Update `wrangler.toml`** with the KV namespace ID from step 2

4. **Deploy:**
   ```bash
   npx wrangler deploy
   ```

5. **Add Cron Trigger:**
   ```bash
   npx wrangler triggers deploy
   ```

## Usage

- **View status page:** `https://solo-empire-monitor.<subdomain>.workers.dev`
- **Get JSON status:** `https://solo-empire-monitor.<subdomain>.workers.dev/status`
- **Manual check:** `https://solo-empire-monitor.<subdomain>.workers.dev/check`

## Cost

**$0/month** — well within free tier limits:
- 288 cron runs/day × 7 checks = 2,016 requests/day
- Free tier: 100,000 requests/day
