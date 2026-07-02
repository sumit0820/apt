import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { verifySubscriptionPaymentSignature } from "@/lib/razorpay";
import { handleOptions, parseJson } from "@/lib/request";
import { verifySubscriptionSchema } from "@/lib/validators";
import { Payment } from "@/models/Payment";
import { PlanCatalog } from "@/models/PlanCatalog";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request as never);
    if (auth instanceof Response) return withCors(auth);

    const body = await parseJson<unknown>(request as never);
    const parsed = verifySubscriptionSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    if (!verifySubscriptionPaymentSignature(parsed.data.paymentId, parsed.data.subscriptionId, parsed.data.signature)) {
      return apiError("Invalid payment signature", 400);
    }

    await connectDb();
    const subRow = await Subscription.findOne({
      razorpaySubscriptionId: parsed.data.subscriptionId,
      userId: auth.userId,
    });
    if (!subRow) return apiError("Subscription record not found", 404);

    const plan = await PlanCatalog.findById(subRow.planCatalogId);

    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + (plan?.durationMonths ?? 1));

    subRow.status = "active";
    subRow.currentStart = now;
    subRow.currentEnd = end;
    subRow.cancelAtCycleEnd = false;
    await subRow.save();

    await User.findByIdAndUpdate(auth.userId, {
      planId: plan?.planKey ?? null,
      subscriptionStatus: "active",
      subscriptionStartedAt: now,
      subscriptionExpiresAt: end,
      whatsappRemovedAt: null,
    });

    await Payment.create({
      userId: auth.userId,
      planId: plan?.planKey ?? "unknown",
      amount: plan?.priceInr ?? 0,
      currency: "INR",
      razorpayOrderId: parsed.data.subscriptionId,
      razorpayPaymentId: parsed.data.paymentId,
      razorpaySignature: parsed.data.signature,
      status: "paid",
    });

    return apiJson({ ok: true });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
