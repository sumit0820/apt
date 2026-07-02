import { apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { serializeTestimonial } from "@/lib/testimonial-serializer";
import { Testimonial } from "@/models/Testimonial";

export async function OPTIONS() {
  return handleOptions();
}

/** Public list of published testimonials — no auth required. */
export async function GET() {
  try {
    await connectDb();
    const rows = await Testimonial.find({ published: true }).sort({ createdAt: -1 }).lean();
    return apiJson({ testimonials: rows.map((r) => serializeTestimonial(r)) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
