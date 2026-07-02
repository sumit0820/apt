import { apiError, apiJson, apiServerError } from "@/lib/api-response";
import { hashPassword, sanitizeUser, signToken } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { signupSchema } from "@/lib/validators";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await parseJson<unknown>(request as never);
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const existing = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (existing) return apiError("Email already registered", 409);

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await User.create({
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      panNumber: parsed.data.panNumber ?? null,
      planId: parsed.data.planId ?? null,
      roles: ["user"],
    });

    const token = signToken(user._id.toString());
    return apiJson({ token, user: sanitizeUser(user) }, 201);
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
