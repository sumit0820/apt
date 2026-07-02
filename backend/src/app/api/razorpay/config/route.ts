import { apiJson } from "@/lib/api-response";
import { getRazorpayKeyId, isRazorpayConfigured } from "@/lib/razorpay";
import { handleOptions } from "@/lib/request";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  return apiJson({
    keyId: getRazorpayKeyId(),
    configured: isRazorpayConfigured(),
  });
}
