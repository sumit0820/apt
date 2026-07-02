import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { adminAddUserSchema } from "@/lib/validators";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const body = await parseJson<unknown>(request as never);
    const parsed = adminAddUserSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) return apiError("Email already registered", 409);

    const user = await User.create({
      email: parsed.data.email.toLowerCase(),
      passwordHash: await hashPassword(parsed.data.password),
      fullName: parsed.data.fullName,
      roles: ["user"],
    });

    return apiJson({ ok: true, userId: user._id.toString() }, 201);
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
