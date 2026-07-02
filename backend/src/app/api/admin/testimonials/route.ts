import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { serializeTestimonial } from "@/lib/testimonial-serializer";
import { testimonialSchema } from "@/lib/validators";
import { Testimonial } from "@/models/Testimonial";

function normalizeMedia(data: { mediaType: string; mediaUrl?: string | null }) {
  if (data.mediaType === "none") return { mediaType: "none" as const, mediaUrl: null };
  return { mediaType: data.mediaType as "image" | "video", mediaUrl: data.mediaUrl?.trim() ?? null };
}

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    await connectDb();
    const rows = await Testimonial.find().sort({ createdAt: -1 }).lean();
    return apiJson({ testimonials: rows.map((r) => serializeTestimonial(r)) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const body = await parseJson<unknown>(request as never);
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const row = await Testimonial.create({
      name: parsed.data.name,
      content: parsed.data.content,
      published: parsed.data.published,
      ...normalizeMedia(parsed.data),
    });
    return apiJson({ testimonial: serializeTestimonial(row) }, 201);
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
