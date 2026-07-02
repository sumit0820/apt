import { apiJson, apiServerError, notFound } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { serializeBlogPost } from "@/lib/blog-serializer";
import { BlogPost } from "@/models/BlogPost";

type Params = { params: Promise<{ slug: string }> };

export async function OPTIONS() {
  return handleOptions();
}

/** Public single published blog post by slug — no auth required. */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const decoded = decodeURIComponent(slug);

    await connectDb();
    const row = await BlogPost.findOne({ slug: decoded, published: true }).lean();
    if (!row) return notFound("Blog post not found");

    return apiJson({ post: serializeBlogPost(row) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
