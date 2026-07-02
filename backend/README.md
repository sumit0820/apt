# APT Backend (Next.js + MongoDB)

Parallel backend API for the Apex Pro Traders frontend. Replaces Supabase server functions with REST endpoints backed by MongoDB.

## Stack

- **Next.js 15** (App Router API routes)
- **MongoDB** via Mongoose
- **JWT** authentication
- **Razorpay** subscriptions + webhook

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env with MongoDB URI, JWT secret, Razorpay keys

npm install
npm run seed   # seeds plans + admin user
npm run dev    # http://localhost:3001
```

Default admin (after seed):

- Email: `admin@apexprotraders.in`
- Password: `AdminPass123!`

## Environment

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing auth tokens |
| `JWT_EXPIRES_IN` | Token TTL (default `7d`) |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:8080`) |
| `RAZORPAY_KEY_ID` | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC secret |

## Authentication

Send JWT on protected routes:

```
Authorization: Bearer <token>
```

## API Endpoints

### Health

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/health` | No |

### Auth

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/auth/signup` | No | `{ email, password, fullName, phone, planId?, panNumber? }` |
| POST | `/api/auth/login` | No | `{ email, password }` |
| GET | `/api/auth/me` | Yes | — |
| POST | `/api/auth/forgot-password` | No | `{ email }` |
| POST | `/api/auth/reset-password` | No | `{ token, password }` |

### Profile

| Method | Path | Auth | Body |
|--------|------|------|------|
| PATCH | `/api/profile` | Yes | `{ panNumber?, phone?, fullName? }` |

### Plans

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/plans` | No |

### Subscriptions

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/subscriptions/create` | Yes | `{ planKey, durationMonths }` |
| POST | `/api/subscriptions/verify` | Yes | `{ subscriptionId, paymentId, signature }` |
| GET | `/api/subscriptions/me` | Yes | — |
| POST | `/api/subscriptions/cancel` | Yes | `{ atCycleEnd?: boolean }` |
| POST | `/api/subscriptions/change` | Yes | `{ planKey, durationMonths, immediate? }` |

### Admin

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/admin/is-admin` | Yes |
| GET | `/api/admin/overview` | Admin |
| GET | `/api/admin/subscribers` | Admin |
| POST | `/api/admin/users` | Admin — `{ email, password, fullName }` |

### Public

| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/api/contact` | No | `{ name, email, message }` |
| GET | `/api/razorpay/config` | No | Returns `{ keyId, configured }` |
| POST | `/api/webhooks/razorpay` | Webhook signature | Razorpay payload |

### Cron (daily subscription maintenance)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/cron/subscriptions` | `Authorization: Bearer $CRON_SECRET` or `x-cron-secret` | Daily job: WhatsApp admin digest + expire subs + remove from groups |

**Schedule:** 6:00 AM IST daily (`30 0 * * *` UTC on Vercel; see `vercel.json`).

**What it does:**
1. Sends a WhatsApp message to the admin listing all active subscriptions expiring in the next 10 days
2. Finds active subscriptions whose `currentEnd` has passed, marks them `expired`, and removes the user from the plan's WhatsApp group

## Daily cron setup

### Option A — Vercel (recommended for serverless)

Deploy the backend to Vercel. `backend/vercel.json` triggers `/api/cron/subscriptions` at **00:30 UTC** (6:00 AM IST).

Set env vars in Vercel dashboard (see `.env.example`).

### Option B — Self-hosted long-running process

```bash
npm run cron   # runs node-cron at 6:00 AM Asia/Kolkata
```

Use a process manager (PM2, systemd) to keep it alive.

### Option C — External scheduler

Call the endpoint manually or via cron-job.org:

```bash
curl -X POST http://localhost:3001/api/cron/subscriptions \
  -H "Authorization: Bearer $CRON_SECRET"
```

Test once without waiting:

```bash
npm run cron:once
```

## WhatsApp configuration

| Variable | Purpose |
|----------|---------|
| `WHATSAPP_TOKEN` | Meta Cloud API token (admin digest messages) |
| `WHATSAPP_PHONE_NUMBER_ID` | Cloud API phone number ID |
| `ADMIN_WHATSAPP_NUMBER` | Admin mobile (E.164, e.g. `919999999999`) |
| `WHATSAPP_GROUP_PLAN_1` | Group JID for plan-1 members |
| `WHATSAPP_GROUP_PLAN_2` | Group JID for plan-2 members |
| `WHATSAPP_EVOLUTION_API_URL` | Evolution API base URL (group removal) |
| `WHATSAPP_EVOLUTION_INSTANCE` | Evolution instance name |
| `WHATSAPP_EVOLUTION_API_KEY` | Evolution API key |
| `WHATSAPP_REMOVE_WEBHOOK_URL` | Optional custom webhook for group removal |

**Note:** Meta WhatsApp Cloud API supports sending text to individuals (admin alerts). Removing users from groups requires Evolution API or a custom webhook — configure one of those for automatic removals.

## Frontend integration

Point the TanStack app at this backend (example):

```env
VITE_API_URL=http://localhost:3001
```

Replace Supabase auth calls with:

1. `POST /api/auth/signup` or `POST /api/auth/login` → store `token`
2. Attach `Authorization: Bearer ${token}` to subscription/admin/contact requests
3. Use `/api/subscriptions/*` instead of TanStack server functions

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on port 3001 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run seed` | Seed plans + admin user |
| `npm run cron` | Long-running scheduler (6 AM IST daily) |
| `npm run cron:once` | Run subscription cron immediately (testing) |
