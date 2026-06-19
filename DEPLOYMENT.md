# EcoCash — Full Deployment Report

Generated: 2026-06-19

---

## ✅ Deployment Readiness Checklist

| Check | Status |
|-------|--------|
| TypeScript — api-server | ✅ Clean |
| TypeScript — ecocash frontend | ✅ Clean |
| TypeScript — lib packages | ✅ Clean |
| Database schema pushed | ✅ Done |
| Telegram webhook registered | ✅ Live |
| Telegram messages tested | ✅ messageId: 33 confirmed |
| Environment secrets configured | ✅ BOT_TOKEN + CHAT_ID set |
| All 8 user flow pages | ✅ Complete |
| Admin approval flow (Approve/Reject) | ✅ Working |
| OTP verification flow (Correct/Wrong) | ✅ Working |

---

## TASK 6 — Render Deployment Settings

### Service 1: API Server (Web Service)

| Setting | Value |
|---------|-------|
| **Service Type** | Web Service |
| **Runtime** | Node |
| **Plan** | Free (or Starter for production) |
| **Root Directory** | *(leave blank — repo root)* |
| **Build Command** | `npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node --enable-source-maps artifacts/api-server/dist/index.mjs` |
| **Health Check Path** | `/api/healthz` |

**Environment Variables for API Server:**

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Hardcode |
| `PORT` | `8080` | Hardcode |
| `BOT_TOKEN` | *your value* | Set as Secret in Render |
| `CHAT_ID` | *your value* | Set as Secret in Render |
| `DATABASE_URL` | *from Render DB* | Copy from your Render PostgreSQL instance |

---

### Service 2: Frontend (Static Site)

| Setting | Value |
|---------|-------|
| **Service Type** | Static Site |
| **Root Directory** | *(leave blank — repo root)* |
| **Build Command** | `npm install -g pnpm && pnpm install --frozen-lockfile && pnpm --filter @workspace/ecocash run build` |
| **Publish Directory** | `artifacts/ecocash/dist` |

> The frontend talks to `/api/*` via relative URLs — no VITE_API_BASE_URL needed as long as both services are on the same domain, or you configure a redirect rule.

---

### Service 3: PostgreSQL Database

| Setting | Value |
|---------|-------|
| **Service Type** | PostgreSQL |
| **Name** | `ecocash-db` |
| **Plan** | Free |
| **Database Name** | `ecocash` |
| **User** | `ecocash` |

After creating the database, copy its **Internal Database URL** and paste it as `DATABASE_URL` in the API server environment variables.

---

## TASK 7 — Telegram Webhook

### Webhook URL Format

After deploying to Render, your webhook URL will be:

```
https://ecocash-api.onrender.com/api/telegram/webhook
```

> **Important:** The path is `/api/telegram/webhook` — not `/telegram/webhook`.

### Auto-Registration (Already Implemented)

The webhook **registers itself automatically** on every server startup. You don't need to run any manual command. The server reads `REPLIT_DOMAINS` (dev) or your production domain and calls Telegram's `setWebhook` API on boot.

### Manual Registration Command (if needed)

If you ever need to manually register or update the webhook, run this curl command:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://ecocash-api.onrender.com/api/telegram/webhook", "drop_pending_updates": true}'
```

Expected response:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Verify Webhook is Active

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

---

## TASK 8 — Final Deployment Report

### GitHub Repository

| Item | Value |
|------|-------|
| **Repository Name** | `ecocash` |
| **Branch** | `main` |
| **Latest Commit** | See: `git log --oneline -1` in your shell |
| **Push Command** | See GitHub Push Steps below |

---

### Required Environment Variables

| Variable | Required By | Where to Get It |
|----------|-------------|-----------------|
| `DATABASE_URL` | API Server | Render → your PostgreSQL → Internal URL |
| `BOT_TOKEN` | API Server | Telegram → @BotFather → `/newbot` |
| `CHAT_ID` | API Server | Telegram group → getUpdates API |
| `PORT` | API Server | Set to `8080` |
| `NODE_ENV` | API Server | Set to `production` |

---

### Step-by-Step Render Deployment

**Step 1 — Push code to GitHub** (see GitHub section below)

**Step 2 — Create PostgreSQL on Render**
1. Render Dashboard → New → PostgreSQL
2. Name: `ecocash-db`, Plan: Free
3. Create → copy the **Internal Database URL**

**Step 3 — Create API Web Service**
1. Render Dashboard → New → Web Service
2. Connect GitHub → select `ecocash` repo
3. Apply settings from Task 6 table above
4. Add all 5 environment variables
5. Deploy

**Step 4 — Create Frontend Static Site**
1. Render Dashboard → New → Static Site
2. Connect same GitHub repo
3. Apply settings from Task 6 table above
4. Deploy

**Step 5 — Verify Telegram webhook**
Check Render logs for:
```
Telegram webhook registered successfully
webhookUrl: "https://ecocash-api.onrender.com/api/telegram/webhook"
```

---

### Risks & Warnings

| Risk | Severity | Mitigation |
|------|----------|------------|
| Render free tier spins down after 15min inactivity | Medium | API will have cold start delay (~30s). Upgrade to Starter ($7/mo) for always-on. |
| Telegram webhook stops working if server URL changes | Low | Re-deploy triggers auto re-registration |
| Free PostgreSQL on Render expires after 90 days | Medium | Upgrade to paid or export data before expiry |
| pnpm not pre-installed on Render | Low | Build command installs it: `npm install -g pnpm` |
| Frontend SPA routing (404 on refresh) | Low | render.yaml includes rewrite rule `/* → /index.html` |

---

### Remaining Manual Actions

1. **Create a GitHub repository** named `ecocash` (see push steps below)
2. **Create Render PostgreSQL** database and copy the Internal URL
3. **Set environment variables** in Render dashboard (BOT_TOKEN, CHAT_ID, DATABASE_URL)
4. Everything else is automated (webhook registration, DB migration on build)

---

## GitHub Push Steps

Since Replit uses its own git system, push to GitHub like this:

### Option A — Via Replit Git Pane (Recommended)
1. Open the **Git** pane in Replit (left sidebar → Git icon)
2. Click **Connect to GitHub**
3. Authorize Replit to access your GitHub
4. Click **Create a GitHub Repository**
5. Name it `ecocash` → Create
6. All commits will sync automatically

### Option B — Via Shell (if you have GitHub credentials)
```bash
# Add your GitHub remote
git remote add github https://github.com/YOUR_USERNAME/ecocash.git

# Push all commits
git push github main
```

### Option C — Download & Upload
1. In Replit → three-dot menu → **Download as ZIP**
2. Extract on your computer
3. `git init && git add . && git commit -m "Initial commit"`
4. Create repo on GitHub and push
