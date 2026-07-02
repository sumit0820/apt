import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, ShieldCheck, Calendar, CreditCard, TrendingUp, XCircle, RefreshCw, ArrowUpCircle, Shield, User, Phone, IdCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/site/Logo";
import { getPlan, PLANS, DURATIONS, getPlanPrice, type Duration } from "@/lib/plans";
import { api, type PlanCatalogRow, type SubscriptionRecord } from "@/lib/api-client";
import { profileSchema, type ProfileFormValues } from "@/lib/form-schemas";
import { FormIconField } from "@/components/forms/form-fields";
import { Form } from "@/components/ui/form";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Apex Pro Traders" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string | null>(null);
  const [sub, setSub] = useState<SubscriptionRecord | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<"cancel" | "switch" | "upgrade" | null>(null);
  const [busy, setBusy] = useState(false);
  const [catalog, setCatalog] = useState<PlanCatalogRow[]>([]);
  const [showProfile, setShowProfile] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: "", phone: "", panNumber: "" },
  });

  async function load() {
    setLoading(true);
    try {
      const [me, subscription, admin, plans] = await Promise.all([
        api.auth.me(),
        api.subscriptions.me(),
        api.admin.isAdmin(),
        api.plans.list().catch(() => ({ plans: [] as PlanCatalogRow[] })),
      ]);
      setEmail(me.user.email);
      setSub(subscription.subscription);
      setIsAdmin(admin.isAdmin);
      setCatalog(plans.plans);
      profileForm.reset({
        fullName: me.user.fullName ?? "",
        phone: me.user.phone ?? "",
        panNumber: me.user.panNumber ?? "",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  function signOut() {
    api.auth.logout();
    toast.success("Signed out");
    navigate({ to: "/auth/login" });
  }

  async function onProfileSubmit(values: ProfileFormValues) {
    try {
      const res = await api.profile.update({
        fullName: values.fullName.trim(),
        phone: values.phone?.trim() || undefined,
        panNumber: values.panNumber?.trim() || undefined,
      });
      profileForm.reset({
        fullName: res.user.fullName ?? "",
        phone: res.user.phone ?? "",
        panNumber: res.user.panNumber ?? "",
      });
      toast.success("Profile updated");
      setShowProfile(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update profile");
    }
  }

  async function doCancel(atCycleEnd: boolean) {
    setBusy(true);
    try {
      await api.subscriptions.cancel(atCycleEnd);
      toast.success(atCycleEnd ? "Will cancel at cycle end" : "Subscription cancelled");
      setDialog(null);
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  async function doChange(planKey: string, months: Duration, immediate: boolean) {
    setBusy(true);
    try {
      const r = await api.subscriptions.change(planKey, months, immediate);
      toast.success(r.scheduled === "now" ? "Plan updated immediately" : "Change will apply at cycle end");
      setDialog(null);
      await load();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(false); }
  }

  const planKey = sub?.plan_catalog?.plan_key;
  const currentMonths = (sub?.plan_catalog?.duration_months as Duration) ?? 3;
  const plan = planKey ? getPlan(planKey) : null;
  const isActive = sub?.status === "active";
  const name = profileForm.watch("fullName");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/"><Logo size="sm" /></Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link to="/admin" className="inline-flex items-center gap-2 rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm text-primary font-semibold hover:bg-primary/20">
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <h1 className="text-3xl font-bold">Welcome back{name ? `, ${name}` : ""}</h1>
            <p className="mt-1 text-muted-foreground">{email}</p>

            <div className="mt-8 grid md:grid-cols-3 gap-4">
              <Card icon={CreditCard} label="Current plan" value={plan?.name ?? "No active plan"} />
              <Card icon={ShieldCheck} label="Status" value={sub?.status ?? "—"} valueClass={isActive ? "text-bull" : "text-primary"} />
              <Card icon={Calendar} label="Renews / ends on" value={sub?.current_end ? new Date(sub.current_end).toLocaleDateString() : "—"} />
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Profile</h2>
                <button
                  type="button"
                  onClick={() => setShowProfile((v) => !v)}
                  className="text-sm text-primary hover:underline"
                >
                  {showProfile ? "Cancel" : "Edit profile"}
                </button>
              </div>
              {showProfile ? (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="mt-4 grid sm:grid-cols-2 gap-3">
                    <FormIconField control={profileForm.control} name="fullName" icon={User} placeholder="Full name" />
                    <FormIconField control={profileForm.control} name="phone" icon={Phone} placeholder="Phone number" />
                    <FormIconField control={profileForm.control} name="panNumber" icon={IdCard} placeholder="PAN" className="sm:col-span-2" />
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={profileForm.formState.isSubmitting}
                        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60"
                      >
                        {profileForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        Save profile
                      </button>
                    </div>
                  </form>
                </Form>
              ) : (
                <dl className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Full name</dt>
                    <dd className="font-medium">{profileForm.getValues("fullName") || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{profileForm.getValues("phone") || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">PAN</dt>
                    <dd className="font-medium">{profileForm.getValues("panNumber") || "—"}</dd>
                  </div>
                </dl>
              )}
            </div>

            {sub?.cancel_at_cycle_end && (
              <div className="mt-4 rounded-md border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-primary">
                Your subscription will cancel at the end of the current cycle.
              </div>
            )}

            {sub && plan && (
              <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-xl font-bold">Manage subscription</h2>
                <p className="text-sm text-muted-foreground mt-1">Duration: {currentMonths} months</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button onClick={() => setDialog("switch")} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-2">
                    <RefreshCw className="h-4 w-4" /> Switch plan
                  </button>
                  <button onClick={() => setDialog("upgrade")} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-surface-2">
                    <ArrowUpCircle className="h-4 w-4" /> Upgrade duration
                  </button>
                  <button onClick={() => setDialog("cancel")} className="inline-flex items-center gap-2 rounded-md border border-destructive/40 text-destructive px-4 py-2 text-sm hover:bg-destructive/10">
                    <XCircle className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="h-10 w-10 text-primary shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">Your trade ideas feed is coming up</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {isActive
                      ? "You'll receive trade ideas on Telegram and WhatsApp. The in-app feed is being prepared and will appear here shortly."
                      : "Subscribe to a plan to start receiving research-backed trade ideas."}
                  </p>
                  {!isActive && (
                    <Link to="/auth/signup" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">
                      Choose a plan
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {dialog === "cancel" && (
        <Modal title="Cancel subscription" onClose={() => setDialog(null)}>
          <p className="text-sm text-muted-foreground">You keep access until the end of the current cycle, or cancel immediately.</p>
          <div className="mt-4 flex gap-2 justify-end">
            <button disabled={busy} onClick={() => doCancel(false)} className="rounded-md border border-destructive/40 text-destructive px-3 py-2 text-sm hover:bg-destructive/10">Cancel now</button>
            <button disabled={busy} onClick={() => doCancel(true)} className="rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-bold hover:brightness-110">Cancel at cycle end</button>
          </div>
        </Modal>
      )}

      {dialog === "switch" && plan && (
        <Modal title="Switch plan" onClose={() => setDialog(null)}>
          <p className="text-sm text-muted-foreground">Switching applies at the end of the current cycle. Duration stays {currentMonths} months.</p>
          <div className="mt-4 space-y-2">
            {PLANS.filter((p) => p.id !== plan.id).map((p) => (
              <button key={p.id} disabled={busy} onClick={() => doChange(p.id, currentMonths, false)} className="w-full text-left rounded-md border border-border p-3 hover:border-primary hover:bg-primary/5 flex justify-between items-center">
                <div>
                  <div className="font-bold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.tagline}</div>
                </div>
                <div className="text-primary font-bold">₹{getPlanPrice(p.id, currentMonths, catalog).toLocaleString("en-IN")}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {dialog === "upgrade" && plan && (
        <Modal title="Change duration" onClose={() => setDialog(null)}>
          <p className="text-sm text-muted-foreground">Upgrades to a longer term apply immediately (prorated by Razorpay). Downgrades apply at cycle end.</p>
          <div className="mt-4 space-y-2">
            {DURATIONS.filter((d) => d !== currentMonths).map((d) => {
              const upgrade = d > currentMonths;
              return (
                <button key={d} disabled={busy} onClick={() => doChange(plan.id, d, upgrade)} className="w-full text-left rounded-md border border-border p-3 hover:border-primary hover:bg-primary/5 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{d} months</div>
                    <div className="text-xs text-muted-foreground">{upgrade ? "Upgrade — applies now" : "Applies at cycle end"}</div>
                  </div>
                  <div className="text-primary font-bold">₹{getPlanPrice(plan.id, d, catalog).toLocaleString("en-IN")}</div>
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Card({ icon: Icon, label, value, valueClass = "" }: { icon: typeof ShieldCheck; label: string; value: string; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </div>
      <div className={`mt-2 font-bold text-lg ${valueClass}`}>{value}</div>
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
