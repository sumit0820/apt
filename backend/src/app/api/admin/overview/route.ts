import { apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { findExpiringSoon } from "@/lib/subscription-queries";
import { handleOptions } from "@/lib/request";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    await connectDb();
    const [totalUsers, activeSubs, expiring, allActive] = await Promise.all([
      User.countDocuments(),
      Subscription.countDocuments({ status: "active" }),
      findExpiringSoon(),
      Subscription.find({ status: "active" }).populate("planCatalogId").lean(),
    ]);

    const mrr =
      allActive.reduce((sum, row) => {
        const plan = row.planCatalogId as unknown as { priceInr?: number; durationMonths?: number } | null;
        const price = plan?.priceInr ?? 0;
        const months = plan?.durationMonths ?? 1;
        return sum + Math.round(price / months);
      }, 0) ?? 0;

    const expiringSoon = expiring.map((e) => {
      const plan = e.planCatalogId;
      const user = e.userId;
      return {
        id: String(e._id),
        current_end: e.currentEnd,
        cancel_at_cycle_end: e.cancelAtCycleEnd,
        email: user?.email ?? null,
        full_name: user?.fullName ?? null,
        plan_key: plan?.planKey ?? "—",
        duration_months: plan?.durationMonths ?? 0,
      };
    });

    return apiJson({
      totalUsers,
      activeSubscribers: activeSubs,
      mrrInr: mrr,
      expiringSoon,
    });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
