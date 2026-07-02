import { apiError, apiJson, apiServerError } from "@/lib/api-response";
import { verifyCronAuth } from "@/lib/cron-auth";
import { handleOptions } from "@/lib/request";
import { runSubscriptionCron } from "@/lib/subscription-cron";

export async function OPTIONS() {
  return handleOptions();
}

/** Daily cron: notify admin about expiring plans + remove expired users from WhatsApp groups. */
export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return apiError("Unauthorized", 401);
  }

  try {
    const result = await runSubscriptionCron();
    return apiJson(result);
  } catch (err) {
    console.error("[cron/subscriptions]", err);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  return GET(request);
}
