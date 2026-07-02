import type { IBlogPost } from "@/models/BlogPost";

export function serializeBlogPost(row: IBlogPost | Record<string, unknown>) {
  const r = row as IBlogPost;
  return {
    id: String(r._id),
    title: r.title,
    tag: r.tag,
    excerpt: r.excerpt,
    content: r.content ?? "",
    publishedAt: r.publishedAt instanceof Date ? r.publishedAt.toISOString() : String(r.publishedAt),
    published: r.published,
    slug: r.slug ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : undefined,
  };
}
