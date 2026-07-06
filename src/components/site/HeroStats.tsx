import { Headphones, ShieldCheck, Target, TrendingUp, Users } from "lucide-react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

const stats = [
  { icon: Users, num: "10K+", label: "Active Traders" },
  { icon: TrendingUp, num: "7+", label: "Years of Experience" },
  { icon: Target, num: "Both Sides", label: "Bull & Bear", featured: true },
  { icon: ShieldCheck, num: "SEBI", label: "Registered RA Firm" },
  { icon: Headphones, num: "Dedicated", label: "Client Support" },
] as const;

export function HeroStats() {
  return (
    <section aria-label="Key metrics" className="hero-stats-band relative overflow-hidden py-12 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_15%_50%,var(--gold-soft),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_85%_50%,oklch(0.82_0.16_85/8%),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/55 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-primary/90 sm:mb-8 sm:text-xs">
          By the numbers
        </p>

        <div className="hero-stats-panel relative overflow-hidden rounded-2xl border border-primary/25 bg-surface/70 shadow-[0_24px_80px_-40px_var(--gold)] backdrop-blur-md">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
          />
          <div
            aria-hidden
            className="hero-stats-grid-bg pointer-events-none absolute inset-0 opacity-40"
          />

          <div className="relative grid grid-cols-1 divide-y divide-border/40 sm:grid-cols-2 sm:divide-x lg:grid-cols-5 lg:divide-y-0">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 80} y={16} className="min-w-0">
                <div
                  className={cn(
                    "group relative flex flex-col items-center gap-3 px-4 py-8 text-center transition-colors duration-300 sm:py-9",
                    s.featured &&
                      "bg-gradient-to-b from-primary/[0.12] via-primary/[0.04] to-transparent lg:shadow-[inset_0_0_40px_-20px_var(--gold)]",
                  )}
                >
                  {s.featured && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent"
                    />
                  )}

                  <div
                    className={cn(
                      "relative grid h-12 w-12 place-items-center rounded-full border transition-all duration-300 group-hover:scale-105",
                      s.featured
                        ? "border-primary/50 bg-primary/15 shadow-[0_0_28px_-6px_var(--gold)]"
                        : "border-primary/30 bg-primary/10 group-hover:border-primary/45 group-hover:shadow-[0_0_24px_-8px_var(--gold)]",
                    )}
                  >
                    <s.icon className={cn("h-5 w-5", s.featured ? "text-primary" : "text-primary/90")} />
                  </div>

                  <div className="space-y-1">
                    <div
                      className={cn(
                        "text-2xl font-extrabold leading-none tracking-tight sm:text-[1.65rem]",
                        s.featured ? "hero-gold-text" : "text-foreground",
                      )}
                    >
                      {s.num}
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[11px]">
                      {s.label}
                    </div>
                  </div>

                  <div
                    aria-hidden
                    className="mt-1 h-0.5 w-8 rounded-full bg-primary/0 transition-all duration-300 group-hover:w-12 group-hover:bg-primary/50"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
