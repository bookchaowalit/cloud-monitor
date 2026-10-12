---
title: "Solo Empire Cloud Monitor"
tags: [documentation, infra]
created: 2026-07-09
updated: 2026-08-08
description: "Documentation for Solo Empire Cloud Monitor."
---

# Solo Empire Cloud Monitor

Cloudflare Worker that monitors your services 24/7 on the **free tier**.

## Features

- Checks 7 domains every 5 minutes via Cron Trigger
- Stores status in KV (last 24 hours)
- Web UI at `https://solo-empire-monitor.<your-subdomain>.workers.dev`
- API endpoints: `/status` (public JSON), `/check` (token-protected manual trigger)
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
   cd cloud-monitor
   npx wrangler kv:namespace create MONITOR_KV
   ```

3. **Update `wrangler.toml`** with the KV namespace ID from step 2

4. **Configure the manual-check token:**
   ```bash
   npx wrangler secret put MONITOR_TOKEN
   ```

   `/status` remains public for the status page. `/check` returns `401` without
   `Authorization: Bearer <MONITOR_TOKEN>` and is disabled until the secret exists.

5. **Deploy:**
   ```bash
   npx wrangler deploy
   ```

6. **Add Cron Trigger:**
   ```bash
   npx wrangler triggers deploy
   ```

## Usage

- **View status page:** `https://solo-empire-monitor.<subdomain>.workers.dev`
- **Get JSON status:** `https://solo-empire-monitor.<subdomain>.workers.dev/status`
- **Manual check:** `curl -H "Authorization: Bearer $MONITOR_TOKEN" https://solo-empire-monitor.<subdomain>.workers.dev/check`

## Cost

**$0/month** — well within free tier limits:
- 288 cron runs/day × 7 checks = 2,016 requests/day
- Free tier: 100,000 requests/day

## ที่มา

ย้ายมาจาก `solo-empire/infra/cloud-monitor/` (2026-10-11) พร้อมประวัติ git. Worker ที่ deploy: `solo-empire-monitor` (monitor.bookchaowalit.com). `wrangler.toml` ยังมี KV id เป็น placeholder — ตั้ง KV จริงก่อน deploy ใหม่; deploy ต้องได้รับอนุมัติจากเจ้าของ.
