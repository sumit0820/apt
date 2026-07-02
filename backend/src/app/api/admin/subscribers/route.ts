import { apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { Subscription } from "@/models/Subscription";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    await connectDb();
    const subs = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("planCatalogId")
      .populate("userId", "email fullName")
      .lean();

    const rows = subs.map((s) => {
      const plan = s.planCatalogId as unknown as {
        planKey?: string;
        durationMonths?: number;
        priceInr?: number;
      } | null;
      const user = s.userId as unknown as { email?: string; fullName?: string } | null;
      return {
        id: String(s._id),
        status: s.status,
        current_end: s.currentEnd,
        plan_key: plan?.planKey ?? "—",
        duration_months: plan?.durationMonths ?? 0,
        price_inr: plan?.priceInr ?? 0,
        email: user?.email ?? null,
        full_name: user?.fullName ?? null,
      };
    });

    return apiJson({ subscribers: rows });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
