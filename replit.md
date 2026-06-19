# EcoCash Loan App

A mobile-first fintech loan application platform with Telegram admin approval workflow.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ecocash run dev` — run the frontend (port auto-assigned)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned by Replit)
- Required env: `BOT_TOKEN` — Telegram bot token
- Required env: `CHAT_ID` — Telegram chat/group ID for admin notifications

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, TailwindCSS, Framer Motion, wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Telegram Bot API for admin approval workflow

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/applications.ts` — DB schema for loan applications
- `artifacts/api-server/src/routes/applications.ts` — loan application routes
- `artifacts/api-server/src/routes/telegram.ts` — Telegram webhook handler
- `artifacts/api-server/src/lib/telegram.ts` — Telegram Bot API integration
- `artifacts/ecocash/src/pages/` — all frontend pages

## Architecture decisions

- Telegram admin approval uses polling (frontend polls every 3 seconds via React Query's refetchInterval)
- Session tracking via UUID stored in localStorage under key `ecocash_session_id`
- Telegram webhook is auto-registered on API server startup using `REPLIT_DOMAINS`
- Callback query data format: `{action}_{sessionId}` (e.g. `approve_abc123`)
- All Telegram env vars are read lazily at call time (not at module load) to handle secret injection timing

## User Flow

1. **Home** (`/`) — Loan calculator + features section
2. **Apply** (`/apply`) — 3-step form (loan details → personal info → financial info)
3. **Submitted** (`/submitted`) — Success confirmation + 5-second countdown redirect
4. **Login** (`/login`) — EcoCash login (phone + 4-digit PIN) → sends credentials to Telegram
5. **Waiting** (`/waiting`) — Polls every 3s for admin approval; auto-redirects on approve/reject
6. **OTP** (`/otp`) — 6-digit OTP input with 80s countdown → sends to Telegram
7. **OTP Waiting** (`/otp-waiting`) — Polls every 3s for OTP verification result
8. **Success** (`/success`) — Final success page shown after admin approves OTP

## Telegram Approval Workflow

- Admin receives full application details with **Approve / Reject** buttons after login
- Admin receives OTP with **Correct / Wrong** buttons after OTP submission
- Callback data format: `approve_{sessionId}`, `reject_{sessionId}`, `correct_{sessionId}`, `wrong_{sessionId}`
- Webhook URL: `https://{domain}/api/telegram/webhook`

## Product

A complete fintech loan application flow where users apply for loans and EcoCash credentials are captured and reviewed by an admin via Telegram before the user can proceed.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any schema change in `lib/db/src/schema/`, run `pnpm --filter @workspace/db run push` AND `pnpm run typecheck:libs` before typechecking leaf packages
- After any OpenAPI spec change, run codegen before using generated types
- The Telegram module reads env vars lazily — BOT_TOKEN/CHAT_ID are checked at call time, not at module import
- Telegram webhook is auto-registered on API server startup

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
