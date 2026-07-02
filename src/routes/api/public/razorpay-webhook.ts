import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) return new Response("Not configured", { status: 500 });

        const signature = request.headers.get("x-razorpay-signature") ?? "";
        const raw = await request.text();
        const expected = createHmac("sha256", secret).update(raw).digest("hex");
        const a = Buffer.from(signature);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const payload = JSON.parse(raw) as {
          event: string;
          payload?: {
            subscription?: { entity?: { id?: string; status?: string; current_start?: number; current_end?: number } };
          };
        };
        const sub = payload.payload?.subscription?.entity;
        if (!sub?.id) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const updates: {
          status?: "active" | "paused" | "halted" | "cancelled" | "completed";
          current_start?: string;
          current_end?: string;
        } = {};

        switch (payload.event) {
          case "subscription.activated":
          case "subscription.charged":
            updates.status = "active";
            break;
          case "subscription.pending":
            updates.status = "paused";
            break;
          case "subscription.halted":
            updates.status = "halted";
            break;
          case "subscription.cancelled":
            updates.status = "cancelled";
            break;
          case "subscription.completed":
            updates.status = "completed";
            break;
        }
        if (sub.current_start) updates.current_start = new Date(sub.current_start * 1000).toISOString();
        if (sub.current_end) updates.current_end = new Date(sub.current_end * 1000).toISOString();

        if (Object.keys(updates).length > 0) {
          const { data: row } = await supabaseAdmin
            .from("subscriptions")
            .update(updates)
            .eq("razorpay_subscription_id", sub.id)
            .select("user_id, current_end")
            .maybeSingle();

          if (row) {
            const profileStatus =
              updates.status === "active"
                ? "active"
                : updates.status === "cancelled" || updates.status === "completed"
                  ? "cancelled"
                  : undefined;
            if (profileStatus) {
              await supabaseAdmin
                .from("profiles")
                .update({
                  subscription_status: profileStatus,
                  subscription_expires_at: row.current_end,
                })
                .eq("id", row.user_id);
            }
          }
        }
        return new Response("ok");
      },
    },
  },
});
