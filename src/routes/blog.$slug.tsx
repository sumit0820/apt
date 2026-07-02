import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Calendar, Loader2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Footer } from "@/components/site/Footer";
import { api } from "@/lib/api-client";
import { formatBlogDate, renderBlogParagraphs } from "@/lib/blogs";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => ({
    meta: [{ title: `Blog — ${decodeURIComponent(params.slug)}` }],
  }),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs", slug],
    queryFn: () => api.blogs.get(slug),
  });

  const post = data?.post;
  const body = post?.content?.trim() || post?.excerpt || "";
  const paragraphs = renderBlogParagraphs(body);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Apex Pro Traders home">
            <Logo size="sm" />
          </Link>
          <Link to="/" hash="blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to blog
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading article…</p>
          </div>
        ) : isError || !post ? (
          <div className="py-24 text-center">
            <h1 className="text-2xl font-bold">Article not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">This note may have been removed or is not published yet.</p>
            <Link to="/" hash="blog" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              View all notes
            </Link>
          </div>
        ) : (
          <article>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                {post.tag}
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatBlogDate(post.publishedAt)}
              </span>
            </div>

            <BookOpen className="mt-8 h-8 w-8 text-primary" />
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-base text-muted-foreground">{post.excerpt}</p>

            <div className="mt-8 space-y-5 border-t border-border pt-8 text-sm leading-relaxed text-foreground/90 sm:text-base">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
