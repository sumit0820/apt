import { Subscription } from "@/models/Subscription";
import type { IUser } from "@/models/User";
import type { IPlanCatalog } from "@/models/PlanCatalog";

export const EXPIRING_WINDOW_DAYS = 10;
const TEN_DAYS_MS = EXPIRING_WINDOW_DAYS * 24 * 60 * 60 * 1000;

export type PopulatedSubscription = {
  _id: unknown;
  currentEnd: Date | null;
  cancelAtCycleEnd: boolean;
  userId: Pick<IUser, "email" | "fullName" | "phone" | "planId" | "whatsappRemovedAt"> & { _id: unknown };
  planCatalogId: Pick<IPlanCatalog, "planKey" | "durationMonths" | "priceInr"> | null;
};

export async function findExpiringSoon(now = new Date()) {
  return Subscription.find({
    status: "active",
    currentEnd: {
      $gte: now,
      $lte: new Date(now.getTime() + TEN_DAYS_MS),
    },
  })
    .sort({ currentEnd: 1 })
    .populate("planCatalogId")
    .populate("userId", "email fullName phone planId whatsappRemovedAt")
    .lean<PopulatedSubscription[]>();
}

export async function findExpiredActive(now = new Date()) {
  return Subscription.find({
    status: "active",
    currentEnd: { $lt: now },
  })
    .populate("planCatalogId")
    .populate("userId", "email fullName phone planId whatsappRemovedAt")
    .lean<PopulatedSubscription[]>();
}

export function formatExpiringRow(sub: PopulatedSubscription, index: number) {
  const user = sub.userId;
  const plan = sub.planCatalogId;
  const end = sub.currentEnd ? sub.currentEnd.toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—";
  return `${index + 1}. ${user?.fullName ?? "—"} (${user?.email ?? "—"})
   Plan: ${plan?.planKey ?? user?.planId ?? "—"} · ${plan?.durationMonths ?? "—"} mo · ends ${end}${sub.cancelAtCycleEnd ? " · auto-cancel" : ""}`;
}
