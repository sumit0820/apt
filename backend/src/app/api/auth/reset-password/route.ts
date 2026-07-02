import crypto from "crypto";
import { apiError, apiJson, apiServerError } from "@/lib/api-response";
import { hashPassword } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { resetPasswordSchema } from "@/lib/validators";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await parseJson<unknown>(request as never);
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const hashed = crypto.createHash("sha256").update(parsed.data.token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return apiError("Invalid or expired reset token", 400);

    user.passwordHash = await hashPassword(parsed.data.password);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return apiJson({ ok: true });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
