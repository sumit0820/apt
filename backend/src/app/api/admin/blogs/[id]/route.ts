import { apiError, apiJson, apiServerError, notFound, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { serializeBlogPost } from "@/lib/blog-serializer";
import { slugifyTitle } from "@/lib/blog-utils";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { blogPostUpdateSchema } from "@/lib/validators";
import { BlogPost } from "@/models/BlogPost";
import mongoose from "mongoose";

type Params = { params: Promise<{ id: string }> };

async function uniqueSlug(base: string, excludeId: string) {
  let slug = base || "post";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const existing = await BlogPost.findOne({ slug: candidate, _id: { $ne: excludeId } }).lean();
    if (!existing) return candidate;
    suffix += 1;
  }
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
    const parsed = blogPostUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const existing = await BlogPost.findById(id);
    if (!existing) return notFound("Blog post not found");

    const updates: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.publishedAt) {
      const publishedAt = new Date(parsed.data.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) return apiError("Invalid publish date");
      updates.publishedAt = publishedAt;
    }

    if (parsed.data.content !== undefined) {
      updates.content = parsed.data.content?.trim() ?? "";
    }

    if (parsed.data.slug !== undefined || parsed.data.title !== undefined) {
      const base = parsed.data.slug?.trim() || slugifyTitle(parsed.data.title ?? existing.title);
      updates.slug = await uniqueSlug(base, id);
    }

    const row = await BlogPost.findByIdAndUpdate(id, updates, { new: true });
    if (!row) return notFound("Blog post not found");

    return apiJson({ post: serializeBlogPost(row) });
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
    if (!mongoose.Types.ObjectId.isValid(id)) return notFound("Blog post not found");

    await connectDb();
    const row = await BlogPost.findByIdAndDelete(id);
    if (!row) return notFound("Blog post not found");

    return apiJson({ ok: true });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
