import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { serializeBlogPost } from "@/lib/blog-serializer";
import { slugifyTitle } from "@/lib/blog-utils";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { blogPostSchema } from "@/lib/validators";
import { BlogPost } from "@/models/BlogPost";

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base || "post";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const query: Record<string, unknown> = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const existing = await BlogPost.findOne(query).lean();
    if (!existing) return candidate;
    suffix += 1;
  }
}

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    await connectDb();
    const rows = await BlogPost.find().sort({ publishedAt: -1 }).lean();
    return apiJson({ posts: rows.map((r) => serializeBlogPost(r)) });
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
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const publishedAt = new Date(parsed.data.publishedAt);
    if (Number.isNaN(publishedAt.getTime())) return apiError("Invalid publish date");

    await connectDb();
    const baseSlug = parsed.data.slug?.trim() || slugifyTitle(parsed.data.title);
    const slug = await uniqueSlug(baseSlug);

    const row = await BlogPost.create({
      title: parsed.data.title,
      tag: parsed.data.tag,
      excerpt: parsed.data.excerpt,
      content: parsed.data.content?.trim() ?? "",
      publishedAt,
      published: parsed.data.published,
      slug,
    });
    return apiJson({ post: serializeBlogPost(row) }, 201);
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
