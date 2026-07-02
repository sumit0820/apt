import { apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { serializeBlogPost } from "@/lib/blog-serializer";
import { BlogPost } from "@/models/BlogPost";

export async function OPTIONS() {
  return handleOptions();
}

/** Public list of published blog posts — no auth required. */
export async function GET() {
  try {
    await connectDb();
    const rows = await BlogPost.find({ published: true }).sort({ publishedAt: -1 }).lean();
    return apiJson({ posts: rows.map((r) => serializeBlogPost(r)) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
