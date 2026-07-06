import { Link } from "@tanstack/react-router";
import { UserPlus, CreditCard, Send, BarChart3, Target, ChevronRight, ShieldCheck, Mail, MessageCircle, ArrowRight, TrendingUp } from "lucide-react";
import { SectionHeader } from "./Strategies";

const STEPS = [
  { icon: UserPlus, title: "Choose Your Strategy", desc: "Select the strategy that aligns with your goals, risk appetite and investment style." },
  { icon: CreditCard, title: "Subscribe Securely", desc: "Complete your subscription using our secure payment gateway (Razorpay). Choose monthly or quarterly plans." },
  { icon: Send, title: "Get Instant Access", desc: "Receive access to our premium Telegram / WhatsApp channel and welcome guide." },
  { icon: BarChart3, title: "Receive Trade Ideas", desc: "Get research-backed trade ideas, entry, targets, stop loss and risk management levels." },
  { icon: Target, title: "Execute & Manage", desc: "You execute the trades in your own account and manage positions with our ongoing support." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-10 lg:py-14 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="HOW IT WORKS"
          title="Simple Process. Powerful Execution."
          subtitle="We make it easy for you to access professional research and actionable trade ideas. You focus on execution, we handle the analysis."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="h-full rounded-xl border border-border bg-surface p-5 sm:p-6">
                <div className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-bold text-sm">{i + 1}</div>
                <div className="mt-5 grid h-16 w-16 place-items-center rounded-full border border-primary/40 mx-auto">
                  <s.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mt-5 text-center font-bold">{s.title}</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-primary z-10 bg-background rounded-full" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <h4 className="text-sm font-bold tracking-wider text-primary">HOW YOU'LL RECEIVE OUR RESEARCH</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              All trade ideas and updates are shared through fast, secure and dedicated communication channels.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Channel icon={Send} color="bg-sky-500" name="Telegram" desc="Real-time alerts & updates" />
              <Channel icon={MessageCircle} color="bg-emerald-500" name="WhatsApp" desc="Important updates & notifications" />
              <Channel icon={Mail} color="bg-amber-500" name="Email (Optional)" desc="Market insights & reports" />
            </div>
            <hr className="my-5 border-border" />
            <div className="flex flex-wrap items-start gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
              <span>No auto-execution. <span className="text-primary font-semibold">You stay in control</span> of your trades.</span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <h4 className="font-bold text-primary">Important Note</h4>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              We are a SEBI Registered Research Analyst firm. We provide research and trade ideas only. You are responsible for your investment decisions and trade execution.
            </p>
            <hr className="my-4 border-border" />
            <p className="text-sm text-primary font-semibold">Past performance is not indicative of future results.</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-primary/30 bg-surface p-4 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex min-w-0 items-start gap-4 lg:flex-1">
              <TrendingUp className="h-10 w-10 shrink-0 text-primary sm:h-12 sm:w-12" />
              <div className="min-w-0">
                <h4 className="text-lg font-bold leading-snug sm:text-xl">
                  Ready to experience professional research the smart way?
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Join thousands of traders and investors who trust our research.
                </p>
              </div>
            </div>
            <Link
              to="/auth/signup"
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:brightness-110 sm:px-6 lg:w-auto lg:whitespace-nowrap"
            >
              View Plans & Subscribe <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Channel({ icon: Icon, color, name, desc }: { icon: typeof Send; color: string; name: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid h-12 w-12 place-items-center rounded-full ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="font-bold text-sm">{name}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
