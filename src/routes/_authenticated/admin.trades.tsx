import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { api, type PastTradeRecord } from "@/lib/api-client";
import { pastTradeSchema, type PastTradeFormValues } from "@/lib/form-schemas";
import { directionClass, formatTradeDate, toDateInputValue } from "@/lib/trades";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/admin/trades")({
  head: () => ({ meta: [{ title: "Manage Trades — Admin" }] }),
  component: AdminTradesPage,
});

function AdminTradesPage() {
  const [trades, setTrades] = useState<PastTradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<PastTradeRecord | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.admin.trades.list();
      setTrades(res.trades);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load trades");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this trade?")) return;
    try {
      await api.admin.trades.remove(id);
      toast.success("Trade deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  if (loading && trades.length === 0) {
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
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Admin home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Past trade examples</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage trades shown in the Performance section on the homepage.</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditing(null); setDialog("add"); }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Add trade
          </button>
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading trades…</p>
            </div>
          ) : trades.length === 0 ? (
            <p className="text-sm text-muted-foreground">No trades yet. Add your first example.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Strategy</th>
                    <th className="py-2 pr-4">Instrument</th>
                    <th className="py-2 pr-4">Direction</th>
                    <th className="py-2 pr-4">Entry</th>
                    <th className="py-2 pr-4">Exit</th>
                    <th className="py-2 pr-4">Outcome</th>
                    <th className="py-2 pr-4">Published</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr key={t.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 whitespace-nowrap">{formatTradeDate(t.tradeDate)}</td>
                      <td className="py-3 pr-4">{t.strategy}</td>
                      <td className="py-3 pr-4">{t.instrument}</td>
                      <td className={`py-3 pr-4 ${directionClass(t.direction)}`}>{t.direction}</td>
                      <td className="py-3 pr-4">{t.entry}</td>
                      <td className="py-3 pr-4">{t.exit}</td>
                      <td className="py-3 pr-4">{t.outcome}</td>
                      <td className="py-3 pr-4">{t.published ? "Yes" : "No"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => { setEditing(t); setDialog("edit"); }}
                            className="rounded-md border border-border p-1.5 hover:bg-surface-2"
                            aria-label="Edit trade"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(t.id)}
                            className="rounded-md border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10"
                            aria-label="Delete trade"
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
        <TradeFormDialog
          mode={dialog}
          initial={editing}
          onClose={() => { setDialog(null); setEditing(null); }}
          onSaved={async () => { setDialog(null); setEditing(null); await load(); }}
        />
      )}
    </div>
  );
}

function TradeFormDialog({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "add" | "edit";
  initial: PastTradeRecord | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const form = useForm<PastTradeFormValues>({
    resolver: zodResolver(pastTradeSchema),
    defaultValues: {
      tradeDate: initial ? toDateInputValue(initial.tradeDate) : new Date().toISOString().slice(0, 10),
      strategy: initial?.strategy ?? "Income",
      instrument: initial?.instrument ?? "",
      direction: initial?.direction ?? "Long",
      entry: initial?.entry ?? "",
      exit: initial?.exit ?? "",
      outcome: initial?.outcome ?? "Completed",
      published: initial?.published ?? true,
    },
  });

  async function onSubmit(values: PastTradeFormValues) {
    const payload = {
      ...values,
      tradeDate: new Date(values.tradeDate).toISOString(),
    };
    try {
      if (mode === "add") {
        await api.admin.trades.create(payload);
        toast.success("Trade added");
      } else if (initial) {
        await api.admin.trades.update(initial.id, payload);
        toast.success("Trade updated");
      }
      await onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save trade");
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
          <h3 className="text-lg font-bold">{mode === "add" ? "Add trade" : "Edit trade"}</h3>

          <FormField
            control={form.control}
            name="tradeDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trade date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="strategy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Strategy</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <option value="Income">Income</option>
                      <option value="Growth">Growth</option>
                      <option value="Diversified">Diversified</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direction</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <option value="Long">Long</option>
                      <option value="Short">Short</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="instrument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instrument</FormLabel>
                <FormControl><Input placeholder="NIFTY 23 MAY 22000 CE" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="entry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry</FormLabel>
                  <FormControl><Input placeholder="165.00 – 170.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exit</FormLabel>
                  <FormControl><Input placeholder="98.20" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outcome</FormLabel>
                <FormControl><Input placeholder="Completed" {...field} /></FormControl>
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
                  <span>Show on public Performance section</span>
                </label>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2">Cancel</button>
            <button type="submit" disabled={busy} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-bold hover:brightness-110 inline-flex items-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "add" ? "Add trade" : "Save changes"}
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
