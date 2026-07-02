import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAuth, sanitizeUser } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { profileUpdateSchema } from "@/lib/validators";

export async function OPTIONS() {
  return handleOptions();
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAuth(request as never);
    if (auth instanceof Response) return withCors(auth);

    const body = await parseJson<unknown>(request as never);
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    if (parsed.data.panNumber !== undefined) auth.user.panNumber = parsed.data.panNumber || null;
    if (parsed.data.phone !== undefined) auth.user.phone = parsed.data.phone;
    if (parsed.data.fullName !== undefined) auth.user.fullName = parsed.data.fullName;
    await auth.user.save();

    return apiJson({ user: sanitizeUser(auth.user) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
