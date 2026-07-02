import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, BookOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { api, type BlogPostRecord } from "@/lib/api-client";
import { formatBlogDate, toDateInputValue } from "@/lib/blogs";
import { blogPostSchema, type BlogPostFormValues } from "@/lib/form-schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin/blogs")({
  head: () => ({ meta: [{ title: "Manage Blog — Admin" }] }),
  component: AdminBlogsPage,
});

function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<BlogPostRecord | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.admin.blogs.list();
      setPosts(res.posts);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await api.admin.blogs.remove(id);
      toast.success("Blog post deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Admin home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Blog posts</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage insights shown in the Blog section on the homepage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditing(null); setDialog("add"); }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add blog post
          </button>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading blog posts…</p>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blog posts yet. Add your first one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Tag</th>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Excerpt</th>
                    <th className="py-2 pr-4">Published</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 align-top">
                      <td className="py-3 pr-4 whitespace-nowrap">{formatBlogDate(p.publishedAt)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap">{p.tag}</td>
                      <td className="py-3 pr-4 font-medium max-w-xs">{p.title}</td>
                      <td className="py-3 pr-4 max-w-md">
                        <p className="line-clamp-2 text-muted-foreground">{p.excerpt}</p>
                      </td>
                      <td className="py-3 pr-4">{p.published ? "Yes" : "No"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setEditing(p); setDialog("edit"); }}
                            className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                            aria-label="Edit blog post"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(p.id)}
                            className="rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10"
                            aria-label="Delete blog post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {dialog && (
        <BlogFormDialog
          mode={dialog}
          initial={editing}
          onClose={() => { setDialog(null); setEditing(null); }}
          onSaved={async () => { setDialog(null); setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

function BlogFormDialog({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  initial: BlogPostRecord | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initial?.title ?? "",
      tag: initial?.tag ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      publishedAt: initial ? toDateInputValue(initial.publishedAt) : new Date().toISOString().slice(0, 10),
      published: initial?.published ?? true,
      slug: initial?.slug ?? "",
    },
  });

  async function onSubmit(values: BlogPostFormValues) {
    const payload = {
      title: values.title,
      tag: values.tag,
      excerpt: values.excerpt,
      content: values.content?.trim() ?? "",
      publishedAt: new Date(values.publishedAt).toISOString(),
      published: values.published,
      slug: values.slug?.trim() || undefined,
    };
    try {
      if (mode === "add") {
        await api.admin.blogs.create(payload);
        toast.success("Blog post added");
      } else if (initial) {
        await api.admin.blogs.update(initial.id, payload);
        toast.success("Blog post updated");
      }
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save blog post");
    }
  }

  const busy = form.formState.isSubmitting;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold inline-flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {mode === "add" ? "Add blog post" : "Edit blog post"}
          </h3>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Post title" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>
                  <FormControl><Input placeholder="Options, Risk, Macro…" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publishedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Publish date</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Textarea rows={3} placeholder="Short summary for the homepage card" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full content (optional)</FormLabel>
                <FormControl>
                  <Textarea rows={6} placeholder="Full article body for future detail pages" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="auto-generated from title if empty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 text-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <span>Show on public Blog section</span>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-bold hover:brightness-110 inline-flex items-center gap-2"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add post" : "Save changes"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
