import { apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { PlanCatalog } from "@/models/PlanCatalog";
import { Subscription } from "@/models/Subscription";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request as never);
    if (auth instanceof Response) return withCors(auth);

    await connectDb();
    const sub = await Subscription.findOne({
      userId: auth.userId,
      status: { $in: ["active", "authenticated", "paused"] },
    })
      .sort({ createdAt: -1 })
      .populate("planCatalogId")
      .lean();

    if (!sub) return apiJson({ subscription: null });

    const plan = sub.planCatalogId as unknown as {
      planKey: string;
      durationMonths: number;
      priceInr: number;
    } | null;

    return apiJson({
      subscription: {
        id: String(sub._id),
        razorpay_subscription_id: sub.razorpaySubscriptionId,
        status: sub.status,
        current_start: sub.currentStart,
        current_end: sub.currentEnd,
        cancel_at_cycle_end: sub.cancelAtCycleEnd,
        plan_catalog: plan
          ? {
              plan_key: plan.planKey,
              duration_months: plan.durationMonths,
              price_inr: plan.priceInr,
            }
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
