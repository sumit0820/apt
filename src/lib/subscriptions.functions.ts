import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const createInput = z.object({
  planKey: z.string(),
  durationMonths: z.number().int().refine((v) => [3, 6, 12].includes(v), "Invalid duration"),
});
const verifyInput = z.object({
  subscriptionId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});
const cancelInput = z.object({ atCycleEnd: z.boolean().default(true) });
const changeInput = z.object({
  planKey: z.string(),
  durationMonths: z.number().int(),
  immediate: z.boolean().default(false),
});

async function razorpayFetch(path: string, opts: { method: string; body?: unknown }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  const auth = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: opts.method,
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error("Razorpay error", path, res.status, txt);
    throw new Error("Razorpay request failed. Please try again or contact support.");
  }
  return res.json();
}

export const createSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: planRow, error: planErr } = await supabaseAdmin
      .from("plan_catalog")
      .select("id, price_inr, razorpay_plan_id, plan_key, duration_months")
      .eq("plan_key", data.planKey)
      .eq("duration_months", data.durationMonths)
      .eq("active", true)
      .maybeSingle();
    if (planErr || !planRow) throw new Error("Selected plan is unavailable");

    const sub = (await razorpayFetch("/subscriptions", {
      method: "POST",
      body: {
        plan_id: planRow.razorpay_plan_id,
        total_count: data.durationMonths,
        customer_notify: 1,
        notes: { user_id: context.userId, plan_key: planRow.plan_key, duration: String(planRow.duration_months) },
      },
    })) as { id: string };

    await supabaseAdmin.from("subscriptions").insert({
      user_id: context.userId,
      plan_catalog_id: planRow.id,
      razorpay_subscription_id: sub.id,
      status: "created",
    });

    return {
      subscriptionId: sub.id,
      keyId: process.env.RAZORPAY_KEY_ID!,
      priceInr: planRow.price_inr,
      planKey: planRow.plan_key,
      durationMonths: planRow.duration_months,
    };
  });

export const verifySubscriptionPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => verifyInput.parse(d))
  .handler(async ({ data, context }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay is not configured");
    const { createHmac } = await import("crypto");
    const expected = createHmac("sha256", keySecret)
      .update(`${data.paymentId}|${data.subscriptionId}`)
      .digest("hex");
    if (expected !== data.signature) throw new Error("Invalid payment signature");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: subRow } = await supabaseAdmin
      .from("subscriptions")
      .select("id, plan_catalog_id, plan_catalog:plan_catalog_id (plan_key, duration_months, price_inr)")
      .eq("razorpay_subscription_id", data.subscriptionId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!subRow) throw new Error("Subscription record not found");

    const now = new Date();
    const end = new Date(now);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const months = (subRow as any).plan_catalog?.duration_months ?? 1;
    end.setMonth(end.getMonth() + months);

    await supabaseAdmin
      .from("subscriptions")
      .update({
        status: "active",
        current_start: now.toISOString(),
        current_end: end.toISOString(),
        cancel_at_cycle_end: false,
      })
      .eq("id", subRow.id);

    await supabaseAdmin
      .from("profiles")
      .update({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plan_id: (subRow as any).plan_catalog?.plan_key ?? null,
        subscription_status: "active",
        subscription_started_at: now.toISOString(),
        subscription_expires_at: end.toISOString(),
      })
      .eq("id", context.userId);

    await supabaseAdmin.from("payments").insert({
      user_id: context.userId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      plan_id: (subRow as any).plan_catalog?.plan_key ?? "unknown",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amount: (subRow as any).plan_catalog?.price_inr ?? 0,
      currency: "INR",
      razorpay_order_id: data.subscriptionId,
      razorpay_payment_id: data.paymentId,
      razorpay_signature: data.signature,
      status: "paid",
    });

    return { ok: true };
  });

export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("subscriptions")
      .select(
        "id, razorpay_subscription_id, status, current_start, current_end, cancel_at_cycle_end, plan_catalog:plan_catalog_id (plan_key, duration_months, price_inr)",
      )
      .eq("user_id", context.userId)
      .in("status", ["active", "authenticated", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  });

export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => cancelInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, razorpay_subscription_id")
      .eq("user_id", context.userId)
      .in("status", ["active", "authenticated", "paused"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub) throw new Error("No active subscription to cancel");

    await razorpayFetch(`/subscriptions/${sub.razorpay_subscription_id}/cancel`, {
      method: "POST",
      body: { cancel_at_cycle_end: data.atCycleEnd ? 1 : 0 },
    });

    await supabaseAdmin
      .from("subscriptions")
      .update({
        cancel_at_cycle_end: data.atCycleEnd,
        status: data.atCycleEnd ? "active" : "cancelled",
      })
      .eq("id", sub.id);

    if (!data.atCycleEnd) {
      await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "cancelled" })
        .eq("id", context.userId);
    }
    return { ok: true };
  });

export const changeMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => changeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("id, razorpay_subscription_id, plan_catalog:plan_catalog_id (price_inr)")
      .eq("user_id", context.userId)
      .in("status", ["active", "authenticated"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub) throw new Error("No active subscription");

    const { data: newPlan } = await supabaseAdmin
      .from("plan_catalog")
      .select("id, price_inr, razorpay_plan_id")
      .eq("plan_key", data.planKey)
      .eq("duration_months", data.durationMonths)
      .eq("active", true)
      .maybeSingle();
    if (!newPlan) throw new Error("Target plan unavailable");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentPrice = (sub as any).plan_catalog?.price_inr ?? 0;
    const isUpgrade = newPlan.price_inr > currentPrice;
    const scheduleAt = data.immediate || isUpgrade ? "now" : "cycle_end";

    await razorpayFetch(`/subscriptions/${sub.razorpay_subscription_id}`, {
      method: "PATCH",
      body: {
        plan_id: newPlan.razorpay_plan_id,
        schedule_change_at: scheduleAt,
        customer_notify: 1,
      },
    });

    if (scheduleAt === "now") {
      await supabaseAdmin
        .from("subscriptions")
        .update({ plan_catalog_id: newPlan.id })
        .eq("id", sub.id);
    }
    return { ok: true, scheduled: scheduleAt };
  });
