import { createHmac, timingSafeEqual } from "crypto";
import { apiJson } from "@/lib/api-response";
import { handleOptions } from "@/lib/request";

const keyId = process.env.RAZORPAY_KEY_ID ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

export async function razorpayFetch<T = unknown>(path: string, opts: { method: string; body?: unknown }) {
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: opts.method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Razorpay error", path, res.status, txt);
    throw new Error("Razorpay request failed");
  }
  return res.json() as Promise<T>;
}

export function getRazorpayKeyId() {
  return keyId;
}

export function isRazorpayConfigured() {
  return Boolean(keyId && keySecret);
}

export function verifySubscriptionPaymentSignature(paymentId: string, subscriptionId: string, signature: string) {
  if (!keySecret) return false;
  const expected = createHmac("sha256", keySecret).update(`${paymentId}|${subscriptionId}`).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyWebhookSignature(raw: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
