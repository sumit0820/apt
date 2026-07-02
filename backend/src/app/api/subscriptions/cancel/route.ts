import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { razorpayFetch } from "@/lib/razorpay";
import { handleOptions, parseJson } from "@/lib/request";
import { cancelSubscriptionSchema } from "@/lib/validators";
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
    const parsed = cancelSubscriptionSchema.safeParse(body ?? {});
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const sub = await Subscription.findOne({
      userId: auth.userId,
      status: { $in: ["active", "authenticated", "paused"] },
    }).sort({ createdAt: -1 });
    if (!sub) return apiError("No active subscription to cancel");

    await razorpayFetch(`/subscriptions/${sub.razorpaySubscriptionId}/cancel`, {
      method: "POST",
      body: { cancel_at_cycle_end: parsed.data.atCycleEnd ? 1 : 0 },
    });

    sub.cancelAtCycleEnd = parsed.data.atCycleEnd;
    sub.status = parsed.data.atCycleEnd ? "active" : "cancelled";
    await sub.save();

    if (!parsed.data.atCycleEnd) {
      await User.findByIdAndUpdate(auth.userId, { subscriptionStatus: "cancelled" });
    }

    return apiJson({ ok: true });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
