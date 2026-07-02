
# Apex Pro Traders — Landing + Auth + Signup Flow

## 1. Landing page (`/`) — single page, smooth scroll

Recreates the 4 uploaded screenshots, dark theme with gold accents.

Sections in order, each with `id` for hash navigation:
- `#home` — Hero with bull/bear/golden-claws image, SEBI badge, headline "Precision Research. Powerful Opportunities. Returns on Both Sides." (last 2 words gold), founder card, Join Us Now + How It Works CTAs, SEBI RA registration card, bottom stats strip (10K+ Traders, 7+ Years, Both Sides, SEBI Registered, Dedicated Support).
- `#strategies` — Two cards: Income Strategy (green, bull) and Growth Strategy (red, bear), bullet lists, min-capital row, "View Details" CTA. "Ready to get started?" bar with Join Us Now + Talk to Our Team.
- `#how-it-works` — 5 numbered cards (Choose Strategy → Subscribe → Get Access → Receive Ideas → Execute) with chevron separators, "How You'll Receive Our Research" + "Important Note" panels, View Plans CTA.
- `#performance` — Trade Insights: 4 feature row (Research Led, Risk Defined, Discipline First, You Execute), Recent Trade Examples table (5 sample rows), Key Note side panel, "Research. Discipline. Consistency." CTA.
- `#about` — About Us section (founder bio, mission, SEBI compliance).
- `#blog` — Blog placeholder grid (3 sample posts).
- `#contact` — Contact section (email, phone, WhatsApp, simple contact form).
- Footer with logo, quick links, SEBI disclaimer, links to `/privacy` and `/terms`.

Header is sticky with: Home, Strategies, How It Works, About Us, Performance, Blog, Contact Us, Login button (→ `/auth/login`), Get Started (→ `/auth/signup`). Nav links use `<a href="#section-id">`; `html { scroll-behavior: smooth }` + `scroll-margin-top` on sections handles the offset. An `IntersectionObserver` hook highlights the active nav link with the gold underline.

## 2. Authentication (Lovable Cloud / Supabase)

Enable Lovable Cloud. Email + password auth (no Google/Apple per request).

**`profiles` table** (linked to `auth.users`):
- `id` (uuid, PK, FK → auth.users on delete cascade)
- `full_name`, `email`, `phone`, `pan_number` (optional)
- `plan_id` (text, nullable)
- `subscription_status` (enum: `pending`, `active`, `cancelled`)
- `subscription_started_at`, `subscription_expires_at`
- `created_at`, `updated_at`
- RLS: user can select/update only their own row; insert via auth trigger.
- Auto-create trigger on `auth.users` insert.

**`payments` table**:
- `id`, `user_id` (FK), `plan_id`, `amount`, `currency` ('INR'), `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `status` (`created`/`paid`/`failed`), `created_at`.
- RLS: user reads own; service role writes.

Both tables get explicit `GRANT` to `authenticated` and `service_role`.

## 3. Routes

- `/auth/login` — email + password form, "Forgot password" link, link to signup.
- `/auth/signup` — 3-step wizard:
  - **Step 1 — Choose Plan**: two cards
    - Plan 1 — ₹2,000 / month
    - Plan 2 — ₹3,000 / month
  - **Step 2 — Your Details**: full name, email, phone, password, confirm password, PAN (optional), agree to T&C + Privacy checkbox. Creates Supabase auth user + profile row (`subscription_status='pending'`, selected `plan_id`).
  - **Step 3 — Payment**: Razorpay checkout. Calls server fn `createRazorpayOrder` → opens Razorpay modal → on success calls `verifyRazorpayPayment` (HMAC SHA256 signature check) → marks profile `active`, sets `subscription_expires_at = now() + 1 month`, inserts paid `payments` row. Shows success screen with "Go to Dashboard" link.
- `/auth/reset-password` — public route to set new password from recovery link.
- `/dashboard` — under `_authenticated/`, simple "Welcome, {name}. Plan: {plan}. Expires: {date}." placeholder so logged-in users land somewhere.
- `/privacy` — Privacy Policy (generated boilerplate for an Indian SEBI-registered RA: data collected, purpose, cookies, third parties incl. Razorpay/Supabase, user rights, retention, contact, governing law India).
- `/terms` — Terms & Conditions (services description, SEBI RA disclaimer "research only, not investment advice / past performance", subscription + refund policy, user obligations, IP, limitation of liability, dispute resolution Mumbai jurisdiction, contact). Both pages have a "Last updated" date and link back home.

## 4. Razorpay integration (manual keys)

- Use `add_secret` to collect `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (server-only). Public key id also exposed as `VITE_RAZORPAY_KEY_ID` for the checkout widget.
- Load Razorpay checkout.js via `<script>` injected on the payment step.
- Server functions in `src/lib/razorpay.functions.ts`:
  - `createRazorpayOrder({ planId })` — protected, creates order via Razorpay REST API, returns `{ orderId, amount, keyId }`.
  - `verifyRazorpayPayment({ orderId, paymentId, signature })` — protected, verifies HMAC with `RAZORPAY_KEY_SECRET`, on match updates profile + inserts payment row.
- No webhook in v1 (can add `/api/public/razorpay-webhook` later for reliability).

## 5. Design system

- Background `#0a0a0a`, cards `#111`, borders `rgba(255,255,255,0.08)`, gold `#FBBF24`, green `#22c55e`, red `#ef4444`. Force `dark` class on `<html>`. Inter font via `<link>` in `__root.tsx`. Tokens declared in `src/styles.css` (oklch).
- Generate 3 hero images with `imagegen` (premium): hero composite, income bull, growth bear → `src/assets/`.

## Technical notes

- File-based routes: `src/routes/index.tsx`, `auth.login.tsx`, `auth.signup.tsx`, `auth.reset-password.tsx`, `privacy.tsx`, `terms.tsx`, `_authenticated/dashboard.tsx`, `_authenticated/route.tsx` (managed).
- Sections live in `src/components/site/*` (Header, Hero, Strategies, HowItWorks, TradeInsights, About, Blog, Contact, Footer).
- Signup wizard state held in a single component with `step` local state.
- Zod validation on every form; server fns re-validate.
- After successful signup payment → `navigate({ to: '/dashboard' })`.

## Out of scope (v1)

- Dashboard beyond a welcome screen (no real trade-idea feed).
- Plan renewal / billing portal / cancellation UI.
- Email notifications (signup confirmation handled by Supabase default).
- Razorpay webhook reconciliation (relying on client-confirmed signature verify only).
