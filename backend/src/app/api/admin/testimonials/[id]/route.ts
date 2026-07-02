import { apiError, apiJson, apiServerError, notFound, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { serializeTestimonial } from "@/lib/testimonial-serializer";
import { testimonialUpdateSchema } from "@/lib/validators";
import { Testimonial } from "@/models/Testimonial";

type Params = { params: Promise<{ id: string }> };

function normalizeMedia(data: { mediaType?: string; mediaUrl?: string | null }) {
  if (data.mediaType === "none") return { mediaType: "none" as const, mediaUrl: null };
  if (data.mediaType === "image" || data.mediaType === "video") {
    return { mediaType: data.mediaType, mediaUrl: data.mediaUrl?.trim() ?? null };
  }
  if (data.mediaUrl !== undefined && !data.mediaUrl?.trim()) return { mediaUrl: null };
  return {};
}

export async function OPTIONS() {
  return handleOptions();
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const { id } = await params;
    const body = await parseJson<unknown>(request as never);
    const parsed = testimonialUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const updates: Record<string, unknown> = { ...parsed.data, ...normalizeMedia(parsed.data) };

    const row = await Testimonial.findByIdAndUpdate(id, updates, { new: true });
    if (!row) return notFound("Testimonial not found");

    return apiJson({ testimonial: serializeTestimonial(row) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const { id } = await params;
    await connectDb();
    const row = await Testimonial.findByIdAndDelete(id);
    if (!row) return notFound("Testimonial not found");

    return apiJson({ ok: true });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
