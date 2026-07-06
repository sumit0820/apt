import { Headphones, ShieldCheck, Target, TrendingUp, Users } from "lucide-react";
import { Reveal } from "./Reveal";

const stats = [
  { icon: Users, num: "10K+", label: "Active Traders" },
  { icon: TrendingUp, num: "7+", label: "Years of Experience" },
  { icon: Target, num: "Both Sides", label: "Bull & Bear", gold: true },
  { icon: ShieldCheck, num: "SEBI", label: "Registered RA Firm" },
  { icon: Headphones, num: "Dedicated", label: "Client Support" },
] as const;

export function HeroStats() {
  return (
    <section aria-label="Key metrics" className="relative border-y border-border/60 bg-surface/40 py-10 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} y={20}>
              <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-surface/80 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_12px_40px_-16px_var(--gold)]">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="relative flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                    <s.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className={`text-base font-bold sm:text-lg ${s.gold ? "text-primary" : "text-foreground"}`}>
                      {s.num}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
