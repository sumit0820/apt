import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Calendar, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatBlogDate } from "@/lib/blogs";
import { SectionHeader } from "./Strategies";

export function Blog() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["blogs", "public"],
    queryFn: () => api.blogs.list(),
  });

  const posts = data?.posts ?? [];

  return (
    <section id="blog" className="py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="INSIGHTS & BLOG"
          title="Notes from the research desk."
          subtitle="Short, practical reads on strategy, risk management and the markets we trade."
        />

        {isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading blog posts…</p>
          </div>
        ) : isError ? (
          <p className="mt-12 text-center text-sm text-destructive">Could not load blog posts. Please try again later.</p>
        ) : posts.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">No blog posts published yet.</p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {posts.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-primary/40 hover:shadow-[0_16px_40px_-24px_var(--gold)]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                    {p.tag}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatBlogDate(p.publishedAt)}
                  </span>
                </div>
                <BookOpen className="mt-6 h-7 w-7 text-primary" />
                <h3 className="mt-3 text-lg font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
                {p.slug ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: p.slug }}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-2.5"
                  >
                    Read note <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
