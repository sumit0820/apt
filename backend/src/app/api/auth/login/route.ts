import { apiError, apiJson, apiServerError } from "@/lib/api-response";
import { sanitizeUser, signToken, verifyPassword } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { loginSchema } from "@/lib/validators";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await parseJson<unknown>(request as never);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) return apiError("Invalid email or password", 401);

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) return apiError("Invalid email or password", 401);

    const token = signToken(user._id.toString());
    return apiJson({ token, user: sanitizeUser(user) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
