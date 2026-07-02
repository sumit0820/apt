import type { ApiUser, BlogPostRecord, PastTradeRecord, PlanCatalogRow, SubscriptionRecord, TestimonialRecord } from "./types";
import { SAMPLE_BLOG_CONTENT } from "@/lib/blog-content";

const STORE_KEY = "apt_mock_store";

export type MockUser = ApiUser & { password: string };

export type MockStore = {
  users: MockUser[];
  subscriptions: SubscriptionRecord[];
  resetTokens: Record<string, { userId: string; expiresAt: string }>;
  contactMessages: Array<{ name: string; email: string; message: string; createdAt: string }>;
  planCatalog: PlanCatalogRow[];
  pastTrades: PastTradeRecord[];
  testimonials: TestimonialRecord[];
  blogPosts: BlogPostRecord[];
};

const DEFAULT_CATALOG: PlanCatalogRow[] = [
  { id: "mock-p1-3", planKey: "plan-1", durationMonths: 3, priceInr: 6000, razorpayPlanId: "mock-rzp-1" },
  { id: "mock-p1-6", planKey: "plan-1", durationMonths: 6, priceInr: 12000, razorpayPlanId: "mock-rzp-1" },
  { id: "mock-p1-12", planKey: "plan-1", durationMonths: 12, priceInr: 24000, razorpayPlanId: "mock-rzp-1" },
  { id: "mock-p2-3", planKey: "plan-2", durationMonths: 3, priceInr: 9000, razorpayPlanId: "mock-rzp-2" },
  { id: "mock-p2-6", planKey: "plan-2", durationMonths: 6, priceInr: 18000, razorpayPlanId: "mock-rzp-2" },
  { id: "mock-p2-12", planKey: "plan-2", durationMonths: 12, priceInr: 36000, razorpayPlanId: "mock-rzp-2" },
];

export const MOCK_SEED_USERS = {
  admin: {
    id: "mock-admin",
    email: "admin@apexprotraders.in",
    password: "AdminPass123!",
    fullName: "Admin User",
  },
  demo: {
    id: "mock-demo",
    email: "user@apexprotraders.in",
    password: "UserPass123!",
    fullName: "Demo User",
    planKey: "plan-1" as const,
    durationMonths: 3,
  },
} as const;

export const DEFAULT_PAST_TRADES: PastTradeRecord[] = [
  { id: "mock-trade-1", tradeDate: "2024-05-20T00:00:00.000Z", strategy: "Income", instrument: "NIFTY 23 MAY 22000 CE", direction: "Short", entry: "165.00 – 170.00", exit: "98.20", outcome: "Completed", published: true },
  { id: "mock-trade-2", tradeDate: "2024-05-17T00:00:00.000Z", strategy: "Growth", instrument: "RELIANCE EQ", direction: "Long", entry: "2,820.00 – 2,860.00", exit: "3,045.00", outcome: "Completed", published: true },
  { id: "mock-trade-3", tradeDate: "2024-05-15T00:00:00.000Z", strategy: "Diversified", instrument: "CRUDE OIL", direction: "Long", entry: "6,100 – 6,250", exit: "6,402.00", outcome: "Completed", published: true },
  { id: "mock-trade-4", tradeDate: "2024-05-10T00:00:00.000Z", strategy: "Income", instrument: "BANKNIFTY 23 MAY 48000 PE", direction: "Short", entry: "210.00 – 220.00", exit: "125.60", outcome: "Completed", published: true },
  { id: "mock-trade-5", tradeDate: "2024-05-08T00:00:00.000Z", strategy: "Growth", instrument: "INFY EQ", direction: "Long", entry: "1,410.00 – 1,440.00", exit: "1,525.00", outcome: "Completed", published: true },
];

export const DEFAULT_TESTIMONIALS: TestimonialRecord[] = [
  {
    id: "mock-testimonial-1",
    name: "Rajesh K.",
    content:
      "APT's research clarity and risk-defined calls helped me stay disciplined through volatile markets. The bull and bear coverage means I'm never caught on the wrong side of the narrative.",
    mediaType: "none",
    mediaUrl: null,
    published: true,
    createdAt: "2024-06-01T00:00:00.000Z",
  },
  {
    id: "mock-testimonial-2",
    name: "Priya M.",
    content:
      "What sets Apex Pro Traders apart is process over hype. Every idea comes with context, levels, and a clear rationale — exactly what a serious trader needs.",
    mediaType: "image",
    mediaUrl: "https://ui-avatars.com/api/?name=Priya+M&background=D4AF37&color=111&size=256&bold=true",
    published: true,
    createdAt: "2024-05-15T00:00:00.000Z",
  },
  {
    id: "mock-testimonial-3",
    name: "Amit S.",
    content:
      "I've subscribed to multiple research services. APT is the first where I felt the team genuinely views the market from both sides — not just permabull recommendations.",
    mediaType: "none",
    mediaUrl: null,
    published: true,
    createdAt: "2024-05-01T00:00:00.000Z",
  },
];

export const DEFAULT_BLOG_POSTS: BlogPostRecord[] = [
  {
    id: "mock-blog-1",
    title: "Why selling premium in low VIX is a discipline game",
    tag: "Options",
    excerpt: "Vol crush is seductive — but only if your hedges and position size were defined before the trade.",
    content: SAMPLE_BLOG_CONTENT["why-selling-premium-in-low-vix-is-a-discipline-game"],
    publishedAt: "2026-06-12T00:00:00.000Z",
    published: true,
    slug: "why-selling-premium-in-low-vix-is-a-discipline-game",
    createdAt: "2026-06-12T00:00:00.000Z",
  },
  {
    id: "mock-blog-2",
    title: "Position sizing: the only edge you fully control",
    tag: "Risk",
    excerpt: "Most blow-ups aren't about bad ideas. They're about good ideas sized like a small one.",
    content: SAMPLE_BLOG_CONTENT["position-sizing-the-only-edge-you-fully-control"],
    publishedAt: "2026-06-04T00:00:00.000Z",
    published: true,
    slug: "position-sizing-the-only-edge-you-fully-control",
    createdAt: "2026-06-04T00:00:00.000Z",
  },
  {
    id: "mock-blog-3",
    title: "Reading RBI's tone: rates, liquidity and bank Nifty",
    tag: "Macro",
    excerpt: "How macro shifts quietly redraw the playbook for index option sellers.",
    content: SAMPLE_BLOG_CONTENT["reading-rbi-tone-rates-liquidity-and-bank-nifty"],
    publishedAt: "2026-05-28T00:00:00.000Z",
    published: true,
    slug: "reading-rbi-tone-rates-liquidity-and-bank-nifty",
    createdAt: "2026-05-28T00:00:00.000Z",
  },
];

function buildDemoSubscription(userId: string, startedAt: string) {
  const { planKey, durationMonths } = MOCK_SEED_USERS.demo;
  const cat = DEFAULT_CATALOG.find((p) => p.planKey === planKey && p.durationMonths === durationMonths)!;
  const start = new Date(startedAt);
  const end = addMonths(start, durationMonths);
  return {
    id: "mock-sub-demo",
    razorpay_subscription_id: `sub_${userId}_${planKey}_${durationMonths}_seed`,
    status: "active",
    current_start: start.toISOString(),
    current_end: end.toISOString(),
    cancel_at_cycle_end: false,
    plan_catalog: {
      plan_key: cat.planKey,
      duration_months: cat.durationMonths,
      price_inr: cat.priceInr,
    },
  } satisfies SubscriptionRecord;
}

function defaultStore(): MockStore {
  const now = new Date().toISOString();
  const demoSub = buildDemoSubscription(MOCK_SEED_USERS.demo.id, now);
  return {
    users: [
      {
        id: MOCK_SEED_USERS.admin.id,
        email: MOCK_SEED_USERS.admin.email,
        password: MOCK_SEED_USERS.admin.password,
        fullName: MOCK_SEED_USERS.admin.fullName,
        phone: null,
        panNumber: null,
        planId: null,
        subscriptionStatus: "none",
        subscriptionStartedAt: null,
        subscriptionExpiresAt: null,
        roles: ["admin", "user"],
        createdAt: now,
      },
      {
        id: MOCK_SEED_USERS.demo.id,
        email: MOCK_SEED_USERS.demo.email,
        password: MOCK_SEED_USERS.demo.password,
        fullName: MOCK_SEED_USERS.demo.fullName,
        phone: "+91 98765 43210",
        panNumber: "ABCDE1234F",
        planId: MOCK_SEED_USERS.demo.planKey,
        subscriptionStatus: "active",
        subscriptionStartedAt: demoSub.current_start,
        subscriptionExpiresAt: demoSub.current_end,
        roles: ["user"],
        createdAt: now,
      },
    ],
    subscriptions: [demoSub],
    resetTokens: {},
    contactMessages: [],
    planCatalog: DEFAULT_CATALOG,
    pastTrades: [...DEFAULT_PAST_TRADES],
    testimonials: [...DEFAULT_TESTIMONIALS],
    blogPosts: [...DEFAULT_BLOG_POSTS],
  };
}

function ensurePastTrades(store: MockStore) {
  if (!store.pastTrades?.length) {
    store.pastTrades = [...DEFAULT_PAST_TRADES];
  }
}

function ensureTestimonials(store: MockStore) {
  if (!store.testimonials?.length) {
    store.testimonials = [...DEFAULT_TESTIMONIALS];
  }
}

function ensureBlogPosts(store: MockStore) {
  if (!store.blogPosts?.length) {
    store.blogPosts = [...DEFAULT_BLOG_POSTS];
    return;
  }
  store.blogPosts = store.blogPosts.map((p) => {
    if (!p.content?.trim() && p.slug && SAMPLE_BLOG_CONTENT[p.slug]) {
      return { ...p, content: SAMPLE_BLOG_CONTENT[p.slug] };
    }
    return p;
  });
}

/** Ensures seed users exist even when localStorage already has an older mock store. */
function ensureSeedUsers(store: MockStore) {
  const now = new Date().toISOString();

  for (const seed of [MOCK_SEED_USERS.admin, MOCK_SEED_USERS.demo]) {
    const existing = store.users.find((u) => u.id === seed.id || u.email === seed.email);
    if (!existing) {
      if (seed.id === MOCK_SEED_USERS.demo.id) {
        const demoSub = buildDemoSubscription(seed.id, now);
        store.users.push({
          id: seed.id,
          email: seed.email,
          password: seed.password,
          fullName: seed.fullName,
          phone: "+91 98765 43210",
          panNumber: "ABCDE1234F",
          planId: MOCK_SEED_USERS.demo.planKey,
          subscriptionStatus: "active",
          subscriptionStartedAt: demoSub.current_start,
          subscriptionExpiresAt: demoSub.current_end,
          roles: ["user"],
          createdAt: now,
        });
        if (!store.subscriptions.some((s) => s.id === demoSub.id)) {
          store.subscriptions.push(demoSub);
        }
      } else {
        store.users.push({
          id: seed.id,
          email: seed.email,
          password: seed.password,
          fullName: seed.fullName,
          phone: null,
          panNumber: null,
          planId: null,
          subscriptionStatus: "none",
          subscriptionStartedAt: null,
          subscriptionExpiresAt: null,
          roles: ["admin", "user"],
          createdAt: now,
        });
      }
    } else if (seed.id === MOCK_SEED_USERS.demo.id) {
      const demoSub = buildDemoSubscription(existing.id, existing.subscriptionStartedAt ?? now);
      if (!store.subscriptions.some((s) => s.razorpay_subscription_id === demoSub.razorpay_subscription_id)) {
        store.subscriptions.push(demoSub);
      }
      existing.planId = MOCK_SEED_USERS.demo.planKey;
      existing.subscriptionStatus = "active";
      existing.subscriptionStartedAt = demoSub.current_start;
      existing.subscriptionExpiresAt = demoSub.current_end;
      existing.fullName = seed.fullName;
      existing.phone = existing.phone ?? "+91 98765 43210";
      existing.panNumber = existing.panNumber ?? "ABCDE1234F";
    }
  }
}

export function loadMockStore(): MockStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      const store = defaultStore();
      saveMockStore(store);
      return store;
    }
    const parsed = JSON.parse(raw) as MockStore;
    if (!parsed.planCatalog?.length) parsed.planCatalog = DEFAULT_CATALOG;
    ensureSeedUsers(parsed);
    ensurePastTrades(parsed);
    ensureTestimonials(parsed);
    ensureBlogPosts(parsed);
    saveMockStore(parsed);
    return parsed;
  } catch {
    const store = defaultStore();
    saveMockStore(store);
    return store;
  }
}

export function saveMockStore(store: MockStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function uid(prefix = "mock") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function toPublicUser(user: MockUser): ApiUser {
  const { password: _p, ...rest } = user;
  return rest;
}
