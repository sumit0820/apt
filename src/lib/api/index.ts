import { clearToken, getToken, setToken } from "./auth-token";
import { ApiError } from "./error";
import { mockApi } from "./mock";
import { realApi } from "./real";

export const isMockMode =
  import.meta.env.VITE_RUN_MOCK === "true" || import.meta.env.RUN_MOCK === "true";

export const api = isMockMode ? mockApi : realApi;

export { ApiError };
export { getToken, setToken, clearToken };
export { API_URL } from "./real";
export type {
  ApiUser,
  PlanCatalogRow,
  SubscriptionRecord,
  AdminOverview,
  AdminSubscriber,
} from "./types";

export function loadRazorpayScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (document.getElementById("razorpay-script")) return resolve();
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Razorpay checkout"));
    document.body.appendChild(s);
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export async function openRazorpaySubscriptionCheckout(opts: {
  keyId: string;
  subscriptionId: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (resp: {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onDismiss?: () => void;
}) {
  if (isMockMode) {
    await new Promise((r) => setTimeout(r, 600));
    await opts.onSuccess({
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_subscription_id: opts.subscriptionId,
      razorpay_signature: "mock_signature",
    });
    return;
  }

  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay checkout is unavailable");

  const rzp = new window.Razorpay({
    key: opts.keyId,
    subscription_id: opts.subscriptionId,
    name: opts.name,
    description: opts.description,
    prefill: opts.prefill,
    theme: { color: "#facc15" },
    handler: opts.onSuccess,
    modal: { ondismiss: opts.onDismiss },
  });
  rzp.open();
}

export async function checkApiHealth() {
  try {
    return await api.health.check();
  } catch {
    return { ok: false, service: isMockMode ? "mock-api" : "api" };
  }
}
