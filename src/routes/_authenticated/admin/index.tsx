import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Users, IndianRupee, Clock, UserPlus, ArrowLeft, Loader2, LineChart, MessageSquareQuote, BookOpen } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { api } from "@/lib/api-client";
import { addUserSchema, type AddUserFormValues } from "@/lib/form-schemas";
import { FormIconField } from "@/components/forms/form-fields";
import { Form } from "@/components/ui/form";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin — Apex Pro Traders" }] }),
  component: AdminDashboardPage,
});

type Overview = Awaited<ReturnType<typeof api.admin.overview>>;
type Subscriber = Overview["expiringSoon"][number] & {
  status?: string;
  price_inr?: number;
};

function AdminDashboardPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [o, s] = await Promise.all([api.admin.overview(), api.admin.subscribers()]);
        setOverview(o);
        setSubs(s.subscribers);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load admin data");
        navigate({ to: "/dashboard" });
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  async function reload() {
    const [o, s] = await Promise.all([api.admin.overview(), api.admin.subscribers()]);
    setOverview(o);
    setSubs(s.subscribers);
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-bold">Admin dashboard</h1>

        <Link
          to="/admin/trades"
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
        >
          <LineChart className="h-4 w-4" /> Manage past trade examples
        </Link>

        <Link
          to="/admin/testimonials"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
        >
          <MessageSquareQuote className="h-4 w-4" /> Manage testimonials
        </Link>

        <Link
          to="/admin/blogs"
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/20"
        >
          <BookOpen className="h-4 w-4" /> Manage blog posts
        </Link>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon={Users} label="Total users" value={overview?.totalUsers ?? 0} />
          <Stat icon={Users} label="Active subscribers" value={overview?.activeSubscribers ?? 0} />
          <Stat icon={IndianRupee} label="MRR (₹)" value={(overview?.mrrInr ?? 0).toLocaleString("en-IN")} />
          <Stat icon={Clock} label="Expiring in 10 days" value={overview?.expiringSoon.length ?? 0} />
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Expiring in next 10 days</h2>
          </div>
          <Table
            headers={["Name", "Email", "Plan", "Duration", "Ends", "Auto-cancel"]}
            rows={(overview?.expiringSoon ?? []).map((r) => [
              r.full_name ?? "—",
              r.email ?? "—",
              r.plan_key,
              `${r.duration_months} mo`,
              r.current_end ? new Date(r.current_end).toLocaleDateString() : "—",
              r.cancel_at_cycle_end ? "Yes" : "No",
            ])}
            empty="No subscriptions expiring soon."
          />
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">All subscribers</h2>
            <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-bold hover:brightness-110">
              <UserPlus className="h-4 w-4" /> Add user
            </button>
          </div>
          <Table
            headers={["Name", "Email", "Plan", "Duration", "Status", "Ends"]}
            rows={subs.map((s) => [
              s.full_name ?? "—",
              s.email ?? "—",
              s.plan_key,
              `${s.duration_months} mo`,
              s.status ?? "—",
              s.current_end ? new Date(s.current_end).toLocaleDateString() : "—",
            ])}
            empty="No subscribers yet."
          />
        </section>
      </main>

      {showAdd && <AddUserDialog onClose={() => setShowAdd(false)} onDone={reload} />}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </div>
      <div className="mt-2 font-bold text-2xl">{value}</div>
    </div>
  );
}

function Table({ headers, rows, empty }: { headers: string[]; rows: (string | number)[][]; empty: string }) {
  if (!rows.length) return <p className="mt-4 text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
            {headers.map((h) => <th key={h} className="py-2 pr-4 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50">
              {r.map((c, j) => <td key={j} className="py-2 pr-4">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AddUserDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: { fullName: "", email: "", password: "" },
  });

  async function onSubmit(values: AddUserFormValues) {
    try {
      await api.admin.addUser({
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
      });
      toast.success("User created");
      onDone();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  const busy = form.formState.isSubmitting;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold">Add user</h3>
          <FormIconField control={form.control} name="fullName" placeholder="Full name" />
          <FormIconField control={form.control} name="email" type="email" placeholder="Email" />
          <FormIconField control={form.control} name="password" type="password" placeholder="Password (min 8 chars)" />
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface-2">Cancel</button>
            <button type="submit" disabled={busy} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-bold hover:brightness-110 flex items-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />} Create
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
