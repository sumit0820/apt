import type { MockStore } from "@/lib/api/mock-store";

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function uniqueBlogSlug(store: MockStore, base: string, excludeId?: string) {
  let slug = base || "post";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const clash = store.blogPosts.some((p) => p.slug === candidate && p.id !== excludeId);
    if (!clash) return candidate;
    suffix += 1;
  }
}

export function formatBlogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

export function blogPostHref(slug: string | null, id: string) {
  return slug ? `/blog/${slug}` : `/blog/${id}`;
}

export function renderBlogParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}
