import { connectDb } from "@/lib/mongodb";
import {
  EXPIRING_WINDOW_DAYS,
  findExpiredActive,
  findExpiringSoon,
  formatExpiringRow,
  type PopulatedSubscription,
} from "@/lib/subscription-queries";
import { removeUserFromWhatsAppGroup, sendAdminWhatsApp } from "@/lib/whatsapp";
import { Subscription } from "@/models/Subscription";
import { User } from "@/models/User";

export type CronRunResult = {
  ranAt: string;
  expiringCount: number;
  adminNotified: boolean;
  adminNotifyError?: string;
  expiredProcessed: number;
  expiredResults: Array<{
    subscriptionId: string;
    email: string | null;
    planKey: string | null;
    whatsappRemoved: boolean;
    whatsappError?: string;
    markedExpired: boolean;
  }>;
};

export async function runSubscriptionCron(now = new Date()): Promise<CronRunResult> {
  await connectDb();

  const expiring = await findExpiringSoon(now);
  const adminMessage = buildAdminExpiringMessage(expiring, now);
  const notify = await sendAdminWhatsApp(adminMessage);

  const expired = await findExpiredActive(now);
  const expiredResults = [];

  for (const sub of expired) {
    expiredResults.push(await processExpiredSubscription(sub));
  }

  return {
    ranAt: now.toISOString(),
    expiringCount: expiring.length,
    adminNotified: notify.ok,
    adminNotifyError: notify.ok ? undefined : notify.reason ?? notify.detail,
    expiredProcessed: expiredResults.length,
    expiredResults,
  };
}

function buildAdminExpiringMessage(expiring: PopulatedSubscription[], now: Date) {
  const dateStr = now.toLocaleDateString("en-IN", { dateStyle: "full", timeZone: "Asia/Kolkata" });
  const header = `*APT — Subscription expiry report*\n${dateStr} (IST)\nPlans expiring in the next ${EXPIRING_WINDOW_DAYS} days:\n`;

  if (!expiring.length) {
    return `${header}\nNo active subscriptions expiring in the next ${EXPIRING_WINDOW_DAYS} days.`;
  }

  const rows = expiring.map((sub, i) => formatExpiringRow(sub, i)).join("\n\n");
  return `${header}\n${rows}`;
}

async function processExpiredSubscription(sub: PopulatedSubscription) {
  const user = sub.userId;
  const plan = sub.planCatalogId;
  const planKey = plan?.planKey ?? user?.planId ?? null;
  const subscriptionId = String(sub._id);

  let whatsappRemoved = false;
  let whatsappError: string | undefined;

  if (!user?.whatsappRemovedAt) {
    const removal = await removeUserFromWhatsAppGroup(user?.phone ?? null, planKey);
    whatsappRemoved = removal.ok;
    if (!removal.ok) {
      whatsappError = removal.detail ?? removal.reason;
    }
  } else {
    whatsappRemoved = true;
  }

  await Subscription.findByIdAndUpdate(sub._id, { status: "expired" });
  await User.findByIdAndUpdate(user?._id, {
    subscriptionStatus: "expired",
    subscriptionExpiresAt: sub.currentEnd,
    ...(whatsappRemoved ? { whatsappRemovedAt: new Date() } : {}),
  });

  return {
    subscriptionId,
    email: user?.email ?? null,
    planKey,
    whatsappRemoved,
    whatsappError,
    markedExpired: true,
  };
}
