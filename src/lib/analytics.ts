// GA4 client-side analytics helpers. Safely no-ops if the measurement ID is
// missing or set to the "test" placeholder.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const RAW_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;
export const GA4_ID = RAW_ID && RAW_ID.startsWith("G-") ? RAW_ID : null;

let initialized = false;

export function initGA4() {
  if (typeof window === "undefined" || initialized || !GA4_ID) return;
  initialized = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID, { send_page_view: false });
}

export function trackPageview(path: string) {
  if (typeof window === "undefined" || !GA4_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackPurchase(params: {
  transactionId: string;
  value: number;
  currency?: string;
  planName: string;
}) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "purchase", {
    transaction_id: params.transactionId,
    value: params.value,
    currency: params.currency ?? "INR",
    items: [{ item_id: params.planName, item_name: params.planName, price: params.value, quantity: 1 }],
  });
}
