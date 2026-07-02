import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ArrowRight, ArrowLeft, User, Mail, Lock, Phone, IdCard } from "lucide-react";
import { PLANS, DURATIONS, getPlanPrice, type Plan, type Duration } from "@/lib/plans";
import { trackPurchase } from "@/lib/analytics";
import {
  api,
  isMockMode,
  openRazorpaySubscriptionCheckout,
  setToken,
  type PlanCatalogRow,
} from "@/lib/api-client";
import { signupDetailsSchema, type SignupDetailsFormValues } from "@/lib/form-schemas";
import { FormIconField } from "@/components/forms/form-fields";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AuthShell } from "./auth.login";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Apex Pro Traders" },
      { name: "description", content: "Create your Apex Pro Traders account: choose a plan and duration, fill your details, and subscribe securely via Razorpay." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [duration, setDuration] = useState<Duration>(3);
  const [submitting, setSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(isMockMode);
  const [catalog, setCatalog] = useState<PlanCatalogRow[]>([]);

  const form = useForm<SignupDetailsFormValues>({
    resolver: zodResolver(signupDetailsSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      pan: "",
      password: "",
      confirm: "",
      agree: false,
    },
  });

  useEffect(() => {
    api.plans.list()
      .then((res) => setCatalog(res.plans))
      .catch(() => setCatalog([]));
  }, []);

  useEffect(() => {
    if (isMockMode) {
      setRazorpayReady(true);
      return;
    }
    api.razorpay.config()
      .then((cfg) => setRazorpayReady(cfg.configured))
      .catch(() => setRazorpayReady(false));
  }, []);

  const total = plan ? getPlanPrice(plan.id, duration, catalog) : 0;
  const monthly = plan && duration > 0 ? Math.round(total / duration) : 0;

  async function onDetailsSubmit(values: SignupDetailsFormValues) {
    if (!plan) {
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const { token } = await api.auth.signup({
        email: values.email.trim(),
        password: values.password,
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        planId: plan.id,
        panNumber: values.pan?.trim() || undefined,
      });
      setToken(token);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePay() {
    if (!plan) return;
    if (!razorpayReady) {
      toast.error("Razorpay is not configured on the server. Check backend .env keys.");
      return;
    }

    const values = form.getValues();
    setSubmitting(true);
    try {
      const sub = await api.subscriptions.create(plan.id, duration);
      await openRazorpaySubscriptionCheckout({
        keyId: sub.keyId,
        subscriptionId: sub.subscriptionId,
        name: "Apex Pro Traders",
        description: `${plan.name} · ${duration} months`,
        prefill: { name: values.fullName, email: values.email, contact: values.phone },
        onSuccess: async (resp) => {
          try {
            await api.subscriptions.verify(
              resp.razorpay_subscription_id,
              resp.razorpay_payment_id,
              resp.razorpay_signature,
            );
            trackPurchase({
              transactionId: resp.razorpay_payment_id,
              value: sub.priceInr,
              currency: "INR",
              planName: `${plan.name} — ${duration}mo`,
            });
            setStep(4);
            toast.success("Subscription active — welcome aboard!");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Verification failed");
          } finally {
            setSubmitting(false);
          }
        },
        onDismiss: () => setSubmitting(false),
      });
    } catch (err) {
      setSubmitting(false);
      toast.error(err instanceof Error ? err.message : "Could not start subscription");
    }
  }

  return (
    <AuthShell>
      <Stepper step={step} />

      {step === 1 && (
        <>
          <h1 className="mt-6 text-2xl font-bold">Choose your plan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pick the strategy and billing cycle that fits your goals.</p>

          <div className="mt-5 flex gap-2 rounded-md bg-surface-2 p-1">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 text-xs font-bold rounded ${duration === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >{d} months</button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {PLANS.map((p) => {
              const selected = plan?.id === p.id;
              const priceTotal = getPlanPrice(p.id, duration, catalog);
              return (
                <button
                  key={p.id}
                  onClick={() => setPlan(p)}
                  type="button"
                  className={`w-full text-left rounded-xl border p-4 transition ${selected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.tagline}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary text-lg">₹{priceTotal.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">for {duration} months</div>
                    </div>
                  </div>
                  <ul className="mt-3 grid sm:grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />{f}</li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <button
            disabled={!plan}
            onClick={() => setStep(2)}
            className="mt-5 w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Already a member? <Link to="/auth/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </>
      )}

      {step === 2 && plan && (
        <>
          <BackButton onClick={() => setStep(1)} />
          <h1 className="mt-2 text-2xl font-bold">Your details</h1>
          <p className="mt-1 text-sm text-muted-foreground">Selected: <span className="text-primary font-semibold">{plan.name}</span> · {duration} months · ₹{total.toLocaleString("en-IN")}</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onDetailsSubmit)} className="mt-5 space-y-3">
              <FormIconField control={form.control} name="fullName" icon={User} placeholder="Full name" />
              <FormIconField control={form.control} name="email" icon={Mail} type="email" placeholder="Email" />
              <FormIconField control={form.control} name="phone" icon={Phone} placeholder="Phone number" />
              <FormIconField control={form.control} name="pan" icon={IdCard} placeholder="PAN (optional)" />
              <FormIconField control={form.control} name="password" icon={Lock} type="password" placeholder="Password (min 8 chars)" />
              <FormIconField control={form.control} name="confirm" icon={Lock} type="password" placeholder="Confirm password" />
              <FormField
                control={form.control}
                name="agree"
                render={({ field }) => (
                  <FormItem>
                    <label className="flex items-start gap-2 text-xs text-muted-foreground">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="mt-0.5 accent-[color:var(--gold)]"
                        />
                      </FormControl>
                      <span>
                        I agree to the <Link to="/terms" className="text-primary hover:underline">Terms &amp; Conditions</Link> and{" "}
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                      </span>
                    </label>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                disabled={submitting || form.formState.isSubmitting}
                className="w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {(submitting || form.formState.isSubmitting) && <Loader2 className="h-4 w-4 animate-spin" />} Continue to payment <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </Form>
        </>
      )}

      {step === 3 && plan && (
        <>
          <BackButton onClick={() => setStep(2)} />
          <h1 className="mt-2 text-2xl font-bold">Start subscription</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isMockMode
              ? "Mock mode — payment will auto-complete without Razorpay."
              : "Recurring subscription via Razorpay. Your card details never touch our servers."}
          </p>
          {!razorpayReady && !isMockMode && (
            <p className="mt-3 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-primary">
              Razorpay keys are missing on the backend. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `backend/.env`.
            </p>
          )}
          <div className="mt-5 rounded-xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">{plan.name}</div>
                <div className="text-xs text-muted-foreground">{duration} monthly cycles · ₹{monthly.toLocaleString("en-IN")}/mo</div>
              </div>
              <div className="font-bold text-primary text-xl">₹{total.toLocaleString("en-IN")}</div>
            </div>
            <hr className="my-4 border-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Charged monthly for {duration} months</span>
              <span className="font-bold">₹{monthly.toLocaleString("en-IN")}/mo</span>
            </div>
          </div>
          <button
            onClick={handlePay}
            disabled={submitting || !razorpayReady}
            className="mt-5 w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isMockMode ? "Complete mock subscription" : "Start subscription with Razorpay"}
          </button>
          <p className="mt-3 text-xs text-center text-muted-foreground">
            {isMockMode ? "Mock checkout — no real payment" : "Powered by Razorpay Subscriptions · 256-bit SSL"}
          </p>
        </>
      )}

      {step === 4 && (
        <div className="text-center py-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bull/15 border border-bull/40">
            <CheckCircle2 className="h-8 w-8 text-bull" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">You're all set!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your subscription is active. Head to your dashboard to get started.</p>
          <button onClick={() => navigate({ to: "/dashboard" })} className="mt-6 w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:brightness-110">
            Go to Dashboard
          </button>
        </div>
      )}
    </AuthShell>
  );
}

function Stepper({ step }: { step: number }) {
  const labels = ["Plan", "Details", "Payment"];
  return (
    <div className="flex items-center gap-2">
      {labels.map((l, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        return (
          <div key={l} className="flex items-center gap-2 flex-1">
            <div className={`h-7 w-7 grid place-items-center rounded-full text-xs font-bold ${done ? "bg-bull text-white" : active ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground"}`}>
              {done ? <CheckCircle2 className="h-4 w-4" /> : n}
            </div>
            <span className={`text-xs font-semibold ${active || done ? "text-foreground" : "text-muted-foreground"}`}>{l}</span>
            {i < labels.length - 1 && <div className={`h-px flex-1 ${done ? "bg-bull" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
      <ArrowLeft className="h-3.5 w-3.5" /> Back
    </button>
  );
}
