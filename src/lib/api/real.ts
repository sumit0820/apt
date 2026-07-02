import { clearToken, getToken } from "./auth-token";
import { ApiError } from "./error";
import type { ApiClient } from "./types";

export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

async function request<T>(path: string, init: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    throw new ApiError(data.error ?? res.statusText ?? "Request failed", res.status);
  }
  return data;
}

export const realApi: ApiClient = {
  auth: {
    signup(body) {
      return request("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }, false);
    },
    login(email, password) {
      return request("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }, false);
    },
    me() {
      return request("/api/auth/me");
    },
    forgotPassword(email) {
      return request("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }, false);
    },
    resetPassword(token, password) {
      return request("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      }, false);
    },
    logout() {
      clearToken();
    },
  },
  profile: {
    update(body) {
      return request("/api/profile", { method: "PATCH", body: JSON.stringify(body) });
    },
  },
  plans: {
    list() {
      return request("/api/plans", {}, false);
    },
  },
  health: {
    check() {
      return request("/api/health", {}, false);
    },
  },
  razorpay: {
    config() {
      return request("/api/razorpay/config", {}, false);
    },
  },
  subscriptions: {
    create(planKey, durationMonths) {
      return request("/api/subscriptions/create", {
        method: "POST",
        body: JSON.stringify({ planKey, durationMonths }),
      });
    },
    verify(subscriptionId, paymentId, signature) {
      return request("/api/subscriptions/verify", {
        method: "POST",
        body: JSON.stringify({ subscriptionId, paymentId, signature }),
      });
    },
    me() {
      return request("/api/subscriptions/me");
    },
    cancel(atCycleEnd = true) {
      return request("/api/subscriptions/cancel", {
        method: "POST",
        body: JSON.stringify({ atCycleEnd }),
      });
    },
    change(planKey, durationMonths, immediate = false) {
      return request("/api/subscriptions/change", {
        method: "POST",
        body: JSON.stringify({ planKey, durationMonths, immediate }),
      });
    },
  },
  admin: {
    isAdmin() {
      return request("/api/admin/is-admin");
    },
    overview() {
      return request("/api/admin/overview");
    },
    subscribers() {
      return request("/api/admin/subscribers");
    },
    addUser(body) {
      return request("/api/admin/users", { method: "POST", body: JSON.stringify(body) });
    },
    trades: {
      list() {
        return request("/api/admin/trades");
      },
      create(body) {
        return request("/api/admin/trades", { method: "POST", body: JSON.stringify(body) });
      },
      update(id, body) {
        return request(`/api/admin/trades/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      },
      remove(id) {
        return request(`/api/admin/trades/${id}`, { method: "DELETE" });
      },
    },
    testimonials: {
      list() {
        return request("/api/admin/testimonials");
      },
      create(body) {
        return request("/api/admin/testimonials", { method: "POST", body: JSON.stringify(body) });
      },
      update(id, body) {
        return request(`/api/admin/testimonials/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      },
      remove(id) {
        return request(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      },
    },
    blogs: {
      list() {
        return request("/api/admin/blogs");
      },
      create(body) {
        return request("/api/admin/blogs", { method: "POST", body: JSON.stringify(body) });
      },
      update(id, body) {
        return request(`/api/admin/blogs/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      },
      remove(id) {
        return request(`/api/admin/blogs/${id}`, { method: "DELETE" });
      },
    },
  },
  trades: {
    list() {
      return request("/api/trades", {}, false);
    },
  },
  testimonials: {
    list() {
      return request("/api/testimonials", {}, false);
    },
  },
  blogs: {
    list() {
      return request("/api/blogs", {}, false);
    },
    get(slug) {
      return request(`/api/blogs/${encodeURIComponent(slug)}`, {}, false);
    },
  },
  contact: {
    submit(body) {
      return request("/api/contact", { method: "POST", body: JSON.stringify(body) }, false);
    },
  },
};
