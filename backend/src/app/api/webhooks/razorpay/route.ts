import { connectDb } from "@/lib/mongodb";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";

type SubscriptionState = "created" | "authenticated" | "active" | "paused" | "halted" | "cancelled" | "completed" | "expired";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return new Response("Not configured", { status: 500 });

  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, signature)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(raw) as {
    event: string;
    payload?: {
      subscription?: {
        entity?: {
          id?: string;
          status?: string;
          current_start?: number;
          current_end?: number;
        };
      };
    };
  };

  const sub = payload.payload?.subscription?.entity;
  if (!sub?.id) return new Response("ok");

  const updates: {
    status?: SubscriptionState;
    currentStart?: Date;
    currentEnd?: Date;
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
    case "subscription.expired":
      updates.status = "expired";
      break;
  }

  if (sub.current_start) updates.currentStart = new Date(sub.current_start * 1000);
  if (sub.current_end) updates.currentEnd = new Date(sub.current_end * 1000);

  if (Object.keys(updates).length > 0) {
    await connectDb();
    const row = await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId: sub.id },
      updates,
      { new: true },
    );

    if (row) {
      const profileStatus =
        updates.status === "active"
          ? "active"
          : updates.status === "expired"
            ? "expired"
          : updates.status === "cancelled" || updates.status === "completed"
            ? "cancelled"
            : undefined;
      if (profileStatus) {
        await User.findByIdAndUpdate(row.userId, {
          subscriptionStatus: profileStatus,
          subscriptionExpiresAt: row.currentEnd,
          ...(profileStatus === "active" ? { whatsappRemovedAt: null } : {}),
        });
      }
    }
  }

  return new Response("ok");
}
