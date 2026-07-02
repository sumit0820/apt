import crypto from "crypto";
import { apiError, apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { forgotPasswordSchema } from "@/lib/validators";
import { User } from "@/models/User";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await parseJson<unknown>(request as never);
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();

      if (process.env.NODE_ENV !== "production") {
        return apiJson({ ok: true, resetToken: token });
      }
    }

    return apiJson({ ok: true, message: "If that email exists, a reset link was sent." });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
