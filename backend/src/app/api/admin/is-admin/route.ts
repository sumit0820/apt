import { apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { handleOptions } from "@/lib/request";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request as never);
    if (auth instanceof Response) return withCors(auth);
    return apiJson({ isAdmin: auth.user.roles.includes("admin") });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
