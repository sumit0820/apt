import { apiError, apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { contactSchema } from "@/lib/validators";
import { ContactMessage } from "@/models/ContactMessage";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(request: Request) {
  try {
    const body = await parseJson<unknown>(request as never);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    await ContactMessage.create(parsed.data);

    return apiJson({ ok: true, message: "Thanks — our team will reach out shortly." });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
