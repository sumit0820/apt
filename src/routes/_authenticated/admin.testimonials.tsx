import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, MessageSquareQuote, Pencil, Plus, Trash2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { api, type TestimonialRecord } from "@/lib/api-client";
import { testimonialSchema, type TestimonialFormValues } from "@/lib/form-schemas";
import { mediaTypeLabel } from "@/lib/testimonials";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  head: () => ({ meta: [{ title: "Manage Testimonials — Admin" }] }),
  component: AdminTestimonialsPage,
});

function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<TestimonialRecord | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.admin.testimonials.list();
      setTestimonials(res.testimonials);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await api.admin.testimonials.remove(id);
      toast.success("Testimonial deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  if (loading && testimonials.length === 0) {
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
            <h1 className="text-3xl font-bold">Testimonials</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage client testimonials shown on the homepage carousel.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setEditing(null); setDialog("add"); }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add testimonial
          </button>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading testimonials…</p>
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-sm text-muted-foreground">No testimonials yet. Add your first one.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Content</th>
                    <th className="py-2 pr-4">Media</th>
                    <th className="py-2 pr-4">Published</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 align-top">
                      <td className="py-3 pr-4 font-medium whitespace-nowrap">{t.name}</td>
                      <td className="py-3 pr-4 max-w-md">
                        <p className="line-clamp-3 text-muted-foreground">{t.content}</p>
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">{mediaTypeLabel(t.mediaType)}</td>
                      <td className="py-3 pr-4">{t.published ? "Yes" : "No"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setEditing(t); setDialog("edit"); }}
                            className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                            aria-label="Edit testimonial"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(t.id)}
                            className="rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10"
                            aria-label="Delete testimonial"
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
        <TestimonialFormDialog
          mode={dialog}
          initial={editing}
          onClose={() => { setDialog(null); setEditing(null); }}
          onSaved={async () => { setDialog(null); setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

function TestimonialFormDialog({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  initial: TestimonialRecord | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: initial?.name ?? "",
      content: initial?.content ?? "",
      mediaType: initial?.mediaType ?? "none",
      mediaUrl: initial?.mediaUrl ?? "",
      published: initial?.published ?? true,
    },
  });

  const mediaType = form.watch("mediaType");

  async function onSubmit(values: TestimonialFormValues) {
    const payload = {
      name: values.name,
      content: values.content,
      mediaType: values.mediaType,
      mediaUrl: values.mediaType === "none" ? null : values.mediaUrl?.trim() || null,
      published: values.published,
    };
    try {
      if (mode === "add") {
        await api.admin.testimonials.create(payload);
        toast.success("Testimonial added");
      } else if (initial) {
        await api.admin.testimonials.update(initial.id, payload);
        toast.success("Testimonial updated");
      }
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save testimonial");
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
            <MessageSquareQuote className="h-5 w-5 text-primary" />
            {mode === "add" ? "Add testimonial" : "Edit testimonial"}
          </h3>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Client name" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea rows={5} placeholder="What did the client say?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mediaType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media type</FormLabel>
                <FormControl>
                  <select {...field} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="none">None</option>
                    <option value="image">Image URL</option>
                    <option value="video">Video link</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mediaType !== "none" && (
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{mediaType === "image" ? "Image URL" : "Video URL"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={mediaType === "image" ? "https://…" : "YouTube or embed URL"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="published"
            render={({ field }) => (
              <FormItem>
                <label className="flex items-center gap-2 text-sm">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <span>Show on public testimonials section</span>
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
              {mode === "add" ? "Add testimonial" : "Save changes"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
