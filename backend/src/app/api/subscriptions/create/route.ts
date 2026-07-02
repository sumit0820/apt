import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { getRazorpayKeyId, isRazorpayConfigured, razorpayFetch } from "@/lib/razorpay";
import { handleOptions, parseJson } from "@/lib/request";
import { createSubscriptionSchema } from "@/lib/validators";
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
    const parsed = createSubscriptionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");
    if (!isRazorpayConfigured()) return apiError("Razorpay is not configured", 500);

    await connectDb();
    const planRow = await PlanCatalog.findOne({
      planKey: parsed.data.planKey,
      durationMonths: parsed.data.durationMonths,
      active: true,
    });
    if (!planRow) return apiError("Selected plan is unavailable");

    const sub = await razorpayFetch<{ id: string }>("/subscriptions", {
      method: "POST",
      body: {
        plan_id: planRow.razorpayPlanId,
        total_count: parsed.data.durationMonths,
        customer_notify: 1,
        notes: {
          user_id: auth.userId,
          plan_key: planRow.planKey,
          duration: String(planRow.durationMonths),
        },
      },
    });

    await Subscription.create({
      userId: auth.userId,
      planCatalogId: planRow._id,
      razorpaySubscriptionId: sub.id,
      status: "created",
    });

    return apiJson({
      subscriptionId: sub.id,
      keyId: getRazorpayKeyId(),
      priceInr: planRow.priceInr,
      planKey: planRow.planKey,
      durationMonths: planRow.durationMonths,
    });
  } catch (err) {
    console.error(err);
    return apiServerError(err instanceof Error ? err.message : undefined);
  }
}
