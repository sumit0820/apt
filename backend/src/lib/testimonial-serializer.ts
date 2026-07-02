import type { ITestimonial } from "@/models/Testimonial";

export function serializeTestimonial(row: ITestimonial | Record<string, unknown>) {
  const r = row as ITestimonial;
  return {
    id: String(r._id),
    name: r.name,
    content: r.content,
    mediaType: r.mediaType ?? "none",
    mediaUrl: r.mediaUrl ?? null,
    published: r.published,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
  };
}
