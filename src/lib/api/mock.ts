import { clearToken, decodeMockToken, encodeMockToken, getToken } from "./auth-token";
import { ApiError } from "./error";
import {
  addMonths,
  loadMockStore,
  saveMockStore,
  toPublicUser,
  uid,
  type MockStore,
  type MockUser,
} from "./mock-store";
import type { ApiClient } from "./types";
import { slugifyTitle, uniqueBlogSlug } from "../blogs";

function delay(ms = 300) {
  return new Promise((r) => setTimeout(r, ms));
}

function withStore<T>(fn: (store: MockStore) => T): T {
  const store = loadMockStore();
  const result = fn(store);
  saveMockStore(store);
  return result;
}

function requireUser(): MockUser {
  const userId = decodeMockToken(getToken());
  if (!userId) throw new ApiError("Unauthorized", 401);
  const store = loadMockStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new ApiError("Unauthorized", 401);
  return user;
}

function findCatalog(planKey: string, durationMonths: number) {
  const store = loadMockStore();
  const row = store.planCatalog.find(
    (p) => p.planKey === planKey && p.durationMonths === durationMonths,
  );
  if (!row) throw new ApiError("Plan not found", 404);
  return row;
}

function syncUserSubscription(user: MockUser, store: MockStore) {
  const sub = store.subscriptions.find(
    (s) => s.razorpay_subscription_id.startsWith(`sub_${user.id}`) && s.status === "active",
  );
  if (sub) {
    user.planId = sub.plan_catalog?.plan_key ?? null;
    user.subscriptionStatus = sub.status;
    user.subscriptionStartedAt = sub.current_start;
    user.subscriptionExpiresAt = sub.current_end;
  }
}

export const mockApi: ApiClient = {
  auth: {
    async signup(body) {
      await delay();
      return withStore((store) => {
        const email = body.email.toLowerCase();
        if (store.users.some((u) => u.email === email)) {
          throw new ApiError("Email already registered", 409);
        }
        const user: MockUser = {
          id: uid("user"),
          email,
          password: body.password,
          fullName: body.fullName,
          phone: body.phone,
          panNumber: body.panNumber ?? null,
          planId: body.planId ?? null,
          subscriptionStatus: "pending",
          subscriptionStartedAt: null,
          subscriptionExpiresAt: null,
          roles: ["user"],
          createdAt: new Date().toISOString(),
        };
        store.users.push(user);
        const token = encodeMockToken(user.id);
        return { token, user: toPublicUser(user) };
      });
    },
    async login(email, password) {
      await delay();
      return withStore((store) => {
        const user = store.users.find(
          (u) => u.email === email.toLowerCase() && u.password === password,
        );
        if (!user) throw new ApiError("Invalid email or password", 401);
        syncUserSubscription(user, store);
        const token = encodeMockToken(user.id);
        return { token, user: toPublicUser(user) };
      });
    },
    async me() {
      await delay(150);
      return withStore((store) => {
        const user = requireUser();
        syncUserSubscription(user, store);
        return { user: toPublicUser(user) };
      });
    },
    async forgotPassword(email) {
      await delay();
      return withStore((store) => {
        const user = store.users.find((u) => u.email === email.toLowerCase());
        if (!user) {
          return { ok: true, message: "If that email exists, a reset link was sent." };
        }
        const token = uid("reset");
        store.resetTokens[token] = {
          userId: user.id,
          expiresAt: addMonths(new Date(), 1).toISOString(),
        };
        return { ok: true, resetToken: token, message: "Dev reset token generated" };
      });
    },
    async resetPassword(token, password) {
      await delay();
      return withStore((store) => {
        const entry = store.resetTokens[token];
        if (!entry || new Date(entry.expiresAt) < new Date()) {
          throw new ApiError("Invalid or expired reset token", 400);
        }
        const user = store.users.find((u) => u.id === entry.userId);
        if (!user) throw new ApiError("Invalid or expired reset token", 400);
        user.password = password;
        delete store.resetTokens[token];
        return { ok: true };
      });
    },
    logout() {
      clearToken();
    },
  },
  profile: {
    async update(body) {
      await delay();
      return withStore((store) => {
        const user = requireUser();
        if (body.fullName !== undefined) user.fullName = body.fullName;
        if (body.phone !== undefined) user.phone = body.phone;
        if (body.panNumber !== undefined) user.panNumber = body.panNumber;
        return { user: toPublicUser(user) };
      });
    },
  },
  plans: {
    async list() {
      await delay(100);
      const store = loadMockStore();
      return { plans: store.planCatalog };
    },
  },
  health: {
    async check() {
      await delay(50);
      return { ok: true, service: "mock-api", timestamp: new Date().toISOString() };
    },
  },
  razorpay: {
    async config() {
      await delay(50);
      return { keyId: "rzp_mock_key", configured: true };
    },
  },
  subscriptions: {
    async create(planKey, durationMonths) {
      await delay();
      const row = findCatalog(planKey, durationMonths);
      const user = requireUser();
      return {
        subscriptionId: `sub_${user.id}_${planKey}_${durationMonths}_${Date.now()}`,
        keyId: "rzp_mock_key",
        priceInr: row.priceInr,
        planKey,
        durationMonths,
      };
    },
    async verify(subscriptionId, paymentId, _signature) {
      await delay();
      return withStore((store) => {
        const user = requireUser();
        const parts = subscriptionId.split("_");
        const planKey = parts[2] ?? user.planId ?? "plan-1";
        const durationMonths = Number(parts[3]) || 3;
        const cat = findCatalog(planKey, durationMonths);

        const now = new Date();
        const end = addMonths(now, durationMonths);
        const record = {
          id: uid("subrec"),
          razorpay_subscription_id: subscriptionId,
          status: "active",
          current_start: now.toISOString(),
          current_end: end.toISOString(),
          cancel_at_cycle_end: false,
          plan_catalog: {
            plan_key: cat.planKey,
            duration_months: cat.durationMonths,
            price_inr: cat.priceInr,
          },
        };

        const idx = store.subscriptions.findIndex((s) => s.razorpay_subscription_id === subscriptionId);
        if (idx >= 0) store.subscriptions[idx] = record;
        else store.subscriptions.push(record);

        user.planId = cat.planKey;
        user.subscriptionStatus = "active";
        user.subscriptionStartedAt = record.current_start;
        user.subscriptionExpiresAt = record.current_end;

        void paymentId;
        return { ok: true };
      });
    },
    async me() {
      await delay(150);
      return withStore((store) => {
        const user = requireUser();
        const sub =
          store.subscriptions.find(
            (s) =>
              s.razorpay_subscription_id.startsWith(`sub_${user.id}`) ||
              s.plan_catalog?.plan_key === user.planId,
          ) ?? null;
        return { subscription: sub };
      });
    },
    async cancel(atCycleEnd = true) {
      await delay();
      return withStore((store) => {
        const user = requireUser();
        const sub = store.subscriptions.find(
          (s) => s.razorpay_subscription_id.startsWith(`sub_${user.id}`) && s.status === "active",
        );
        if (!sub) throw new ApiError("No active subscription", 404);
        if (atCycleEnd) {
          sub.cancel_at_cycle_end = true;
        } else {
          sub.status = "cancelled";
          user.subscriptionStatus = "cancelled";
        }
        return { ok: true };
      });
    },
    async change(planKey, durationMonths, immediate = false) {
      await delay();
      return withStore((store) => {
        const user = requireUser();
        const cat = findCatalog(planKey, durationMonths);
        const sub = store.subscriptions.find(
          (s) => s.razorpay_subscription_id.startsWith(`sub_${user.id}`) && s.status === "active",
        );
        if (!sub) throw new ApiError("No active subscription", 404);

        if (immediate) {
          sub.plan_catalog = {
            plan_key: cat.planKey,
            duration_months: cat.durationMonths,
            price_inr: cat.priceInr,
          };
          user.planId = cat.planKey;
        }

        return { ok: true, scheduled: immediate ? "now" : "cycle_end" };
      });
    },
  },
  admin: {
    async isAdmin() {
      await delay(100);
      return withStore(() => {
        const user = requireUser();
        return { isAdmin: user.roles.includes("admin") };
      });
    },
    async overview() {
      await delay();
      return withStore((store) => {
        requireUser();
        const active = store.subscriptions.filter((s) => s.status === "active");
        const mrrInr = active.reduce((sum, s) => {
          const months = s.plan_catalog?.duration_months ?? 3;
          const price = s.plan_catalog?.price_inr ?? 0;
          return sum + Math.round(price / months);
        }, 0);

        const soon = new Date();
        soon.setDate(soon.getDate() + 10);

        const expiringSoon = active
          .filter((s) => s.current_end && new Date(s.current_end) <= soon)
          .map((s) => {
            const u = store.users.find((usr) => s.razorpay_subscription_id.startsWith(`sub_${usr.id}`));
            return {
              id: s.id,
              current_end: s.current_end,
              cancel_at_cycle_end: s.cancel_at_cycle_end,
              email: u?.email ?? null,
              full_name: u?.fullName ?? null,
              plan_key: s.plan_catalog?.plan_key ?? "—",
              duration_months: s.plan_catalog?.duration_months ?? 0,
            };
          });

        return {
          totalUsers: store.users.length,
          activeSubscribers: active.length,
          mrrInr,
          expiringSoon,
        };
      });
    },
    async subscribers() {
      await delay();
      return withStore((store) => {
        requireUser();
        const subscribers = store.subscriptions.map((s) => {
          const u = store.users.find((usr) => s.razorpay_subscription_id.startsWith(`sub_${usr.id}`));
          return {
            id: s.id,
            status: s.status,
            current_end: s.current_end,
            plan_key: s.plan_catalog?.plan_key ?? "—",
            duration_months: s.plan_catalog?.duration_months ?? 0,
            price_inr: s.plan_catalog?.price_inr ?? 0,
            email: u?.email ?? null,
            full_name: u?.fullName ?? null,
          };
        });
        return { subscribers };
      });
    },
    async addUser(body) {
      await delay();
      return withStore((store) => {
        requireUser();
        const email = body.email.toLowerCase();
        if (store.users.some((u) => u.email === email)) {
          throw new ApiError("Email already registered", 409);
        }
        const user: MockUser = {
          id: uid("user"),
          email,
          password: body.password,
          fullName: body.fullName,
          phone: null,
          panNumber: null,
          planId: null,
          subscriptionStatus: "none",
          subscriptionStartedAt: null,
          subscriptionExpiresAt: null,
          roles: ["user"],
          createdAt: new Date().toISOString(),
        };
        store.users.push(user);
        return { ok: true, userId: user.id };
      });
    },
    trades: {
      async list() {
        await delay();
        const store = loadMockStore();
        return {
          trades: [...store.pastTrades].sort(
            (a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime(),
          ),
        };
      },
      async create(body) {
        await delay();
        return withStore((store) => {
          requireUser();
          const trade = { ...body, id: uid("trade") };
          store.pastTrades.unshift(trade);
          return { trade };
        });
      },
      async update(id, body) {
        await delay();
        return withStore((store) => {
          requireUser();
          const idx = store.pastTrades.findIndex((t) => t.id === id);
          if (idx < 0) throw new ApiError("Trade not found", 404);
          store.pastTrades[idx] = { ...store.pastTrades[idx], ...body, id };
          return { trade: store.pastTrades[idx] };
        });
      },
      async remove(id) {
        await delay();
        return withStore((store) => {
          requireUser();
          const before = store.pastTrades.length;
          store.pastTrades = store.pastTrades.filter((t) => t.id !== id);
          if (store.pastTrades.length === before) throw new ApiError("Trade not found", 404);
          return { ok: true };
        });
      },
    },
    testimonials: {
      async list() {
        await delay();
        const store = loadMockStore();
        return {
          testimonials: [...store.testimonials].sort(
            (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
          ),
        };
      },
      async create(body) {
        await delay();
        return withStore((store) => {
          requireUser();
          const testimonial = {
            ...body,
            mediaUrl: body.mediaType === "none" ? null : body.mediaUrl ?? null,
            id: uid("testimonial"),
            createdAt: new Date().toISOString(),
          };
          store.testimonials.unshift(testimonial);
          return { testimonial };
        });
      },
      async update(id, body) {
        await delay();
        return withStore((store) => {
          requireUser();
          const idx = store.testimonials.findIndex((t) => t.id === id);
          if (idx < 0) throw new ApiError("Testimonial not found", 404);
          const next = { ...store.testimonials[idx], ...body, id };
          if (next.mediaType === "none") next.mediaUrl = null;
          store.testimonials[idx] = next;
          return { testimonial: store.testimonials[idx] };
        });
      },
      async remove(id) {
        await delay();
        return withStore((store) => {
          requireUser();
          const before = store.testimonials.length;
          store.testimonials = store.testimonials.filter((t) => t.id !== id);
          if (store.testimonials.length === before) throw new ApiError("Testimonial not found", 404);
          return { ok: true };
        });
      },
    },
    blogs: {
      async list() {
        await delay();
        const store = loadMockStore();
        return {
          posts: [...store.blogPosts].sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
          ),
        };
      },
      async create(body) {
        await delay();
        return withStore((store) => {
          requireUser();
          const slugBase = body.slug?.trim() || slugifyTitle(body.title);
          const post = {
            id: uid("blog"),
            title: body.title,
            tag: body.tag,
            excerpt: body.excerpt,
            content: body.content?.trim() ?? "",
            publishedAt: body.publishedAt,
            published: body.published,
            slug: uniqueBlogSlug(store, slugBase),
            createdAt: new Date().toISOString(),
          };
          store.blogPosts.unshift(post);
          return { post };
        });
      },
      async update(id, body) {
        await delay();
        return withStore((store) => {
          requireUser();
          const idx = store.blogPosts.findIndex((p) => p.id === id);
          if (idx < 0) throw new ApiError("Blog post not found", 404);
          const current = store.blogPosts[idx];
          const next = {
            ...current,
            ...body,
            id,
            content: body.content !== undefined ? body.content.trim() : current.content,
          };
          if (body.slug?.trim() || body.title) {
            next.slug = uniqueBlogSlug(store, body.slug?.trim() || slugifyTitle(body.title ?? current.title), id);
          }
          store.blogPosts[idx] = next;
          return { post: store.blogPosts[idx] };
        });
      },
      async remove(id) {
        await delay();
        return withStore((store) => {
          requireUser();
          const before = store.blogPosts.length;
          store.blogPosts = store.blogPosts.filter((p) => p.id !== id);
          if (store.blogPosts.length === before) throw new ApiError("Blog post not found", 404);
          return { ok: true };
        });
      },
    },
  },
  trades: {
    async list() {
      await delay(200);
      const store = loadMockStore();
      const trades = store.pastTrades
        .filter((t) => t.published)
        .sort((a, b) => new Date(b.tradeDate).getTime() - new Date(a.tradeDate).getTime());
      return { trades };
    },
  },
  testimonials: {
    async list() {
      await delay(200);
      const store = loadMockStore();
      const testimonials = store.testimonials
        .filter((t) => t.published)
        .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
      return { testimonials };
    },
  },
  blogs: {
    async list() {
      await delay(200);
      const store = loadMockStore();
      const posts = store.blogPosts
        .filter((p) => p.published)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      return { posts };
    },
    async get(slug) {
      await delay(200);
      const store = loadMockStore();
      const post = store.blogPosts.find((p) => p.slug === slug && p.published);
      if (!post) throw new ApiError("Blog post not found", 404);
      return { post };
    },
  },
  contact: {
    async submit(body) {
      await delay();
      return withStore((store) => {
        store.contactMessages.push({ ...body, createdAt: new Date().toISOString() });
        return { ok: true, message: "Thanks — our team will reach out shortly." };
      });
    },
  },
};
