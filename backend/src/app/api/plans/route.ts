import { apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { PlanCatalog } from "@/models/PlanCatalog";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    await connectDb();
    const plans = await PlanCatalog.find({ active: true }).sort({ planKey: 1, durationMonths: 1 }).lean();
    return apiJson({
      plans: plans.map((p) => ({
        id: String(p._id),
        planKey: p.planKey,
        durationMonths: p.durationMonths,
        priceInr: p.priceInr,
        razorpayPlanId: p.razorpayPlanId,
      })),
    });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
