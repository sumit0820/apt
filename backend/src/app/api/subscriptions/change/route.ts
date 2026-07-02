import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { razorpayFetch } from "@/lib/razorpay";
import { handleOptions, parseJson } from "@/lib/request";
import { changeSubscriptionSchema } from "@/lib/validators";
import { PlanCatalog } from "@/models/PlanCatalog";
import { Subscription } from "@/models/Subscription";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request as never);
    if (auth instanceof Response) return withCors(auth);

    const body = await parseJson<unknown>(request as never);
    const parsed = changeSubscriptionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const sub = await Subscription.findOne({
      userId: auth.userId,
      status: { $in: ["active", "authenticated"] },
    }).sort({ createdAt: -1 });
    if (!sub) return apiError("No active subscription");

    const currentPlan = await PlanCatalog.findById(sub.planCatalogId);
    const newPlan = await PlanCatalog.findOne({
      planKey: parsed.data.planKey,
      durationMonths: parsed.data.durationMonths,
      active: true,
    });
    if (!newPlan) return apiError("Target plan unavailable");

    const currentPrice = currentPlan?.priceInr ?? 0;
    const isUpgrade = newPlan.priceInr > currentPrice;
    const scheduleAt = parsed.data.immediate || isUpgrade ? "now" : "cycle_end";

    await razorpayFetch(`/subscriptions/${sub.razorpaySubscriptionId}`, {
      method: "PATCH",
      body: {
        plan_id: newPlan.razorpayPlanId,
        schedule_change_at: scheduleAt,
        customer_notify: 1,
      },
    });

    if (scheduleAt === "now") {
      sub.planCatalogId = newPlan._id;
      await sub.save();
    }

    return apiJson({ ok: true, scheduled: scheduleAt });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
