import { apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  try {
    await connectDb();
    return apiJson({ ok: true, service: "apt-backend", timestamp: new Date().toISOString() });
  } catch {
    return apiJson({ ok: false, service: "apt-backend" }, 503);
  }
}
