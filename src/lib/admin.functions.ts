import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ count: totalUsers }, { count: activeSubs }, { data: expiring }, { data: allActive }] =
      await Promise.all([
        supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabaseAdmin
          .from("subscriptions")
          .select(
            "id, current_end, cancel_at_cycle_end, user_id, plan_catalog:plan_catalog_id (plan_key, duration_months, price_inr)",
          )
          .eq("status", "active")
          .gte("current_end", new Date().toISOString())
          .lte("current_end", new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString())
          .order("current_end", { ascending: true }),
        supabaseAdmin
          .from("subscriptions")
          .select("plan_catalog:plan_catalog_id (price_inr, duration_months)")
          .eq("status", "active"),
      ]);

    const mrr =
      (allActive ?? []).reduce((sum: number, r: any) => {
        const price = r.plan_catalog?.price_inr ?? 0;
        const months = r.plan_catalog?.duration_months ?? 1;
        return sum + Math.round(price / months);
      }, 0) ?? 0;

    let expiringEnriched: Array<{
      id: string;
      current_end: string | null;
      cancel_at_cycle_end: boolean;
      email: string | null;
      full_name: string | null;
      plan_key: string;
      duration_months: number;
    }> = [];
    if (expiring && expiring.length > 0) {
      const userIds = expiring.map((e: any) => e.user_id);
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      expiringEnriched = expiring.map((e: any) => ({
        id: e.id,
        current_end: e.current_end,
        cancel_at_cycle_end: e.cancel_at_cycle_end,
        email: map.get(e.user_id)?.email ?? null,
        full_name: map.get(e.user_id)?.full_name ?? null,
        plan_key: e.plan_catalog?.plan_key ?? "—",
        duration_months: e.plan_catalog?.duration_months ?? 0,
      }));
    }

    return {
      totalUsers: totalUsers ?? 0,
      activeSubscribers: activeSubs ?? 0,
      mrrInr: mrr,
      expiringSoon: expiringEnriched,
    };
  });

export const listAllSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select(
        "id, status, current_end, user_id, plan_catalog:plan_catalog_id (plan_key, duration_months, price_inr)",
      )
      .order("created_at", { ascending: false })
      .limit(200);

    const userIds = (subs ?? []).map((s: any) => s.user_id);
    let profs: any[] = [];
    if (userIds.length) {
      const { data } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      profs = data ?? [];
    }
    const map = new Map(profs.map((p: any) => [p.id, p]));
    return (subs ?? []).map((s: any) => ({
      id: s.id,
      status: s.status,
      current_end: s.current_end,
      plan_key: s.plan_catalog?.plan_key ?? "—",
      duration_months: s.plan_catalog?.duration_months ?? 0,
      price_inr: s.plan_catalog?.price_inr ?? 0,
      email: map.get(s.user_id)?.email ?? null,
      full_name: map.get(s.user_id)?.full_name ?? null,
    }));
  });

const addUserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(80),
});

export const adminAddUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => addUserInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name },
    });
    if (error) throw new Error(error.message);
    return { ok: true, userId: created.user?.id };
  });

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return !!data;
  });
