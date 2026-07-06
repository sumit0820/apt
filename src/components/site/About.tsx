import { ShieldCheck, Award, Target, Users } from "lucide-react";
import { SectionHeader } from "./Strategies";

export function About() {
  return (
    <section id="about" className="py-10 lg:py-14 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="ABOUT US"
          title="Built on research. Driven by discipline."
          subtitle="Apex Pro Traders is a SEBI Registered Research Analyst firm founded with a single mission: to make professional, research-backed trade ideas accessible to serious retail investors."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-primary/40 bg-primary/15 sm:h-16 sm:w-16">
                <Award className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold sm:text-2xl">Dhairya Mehta, CFA</h3>
                <p className="text-primary text-sm font-semibold">Founder &amp; Research Head</p>
              </div>
            </div>
            <p className="mt-5 text-muted-foreground">
              A CFA Charterholder with 7+ years of active market experience across multiple cycles, Dhairya leads the research desk at APT. His framework blends fundamental conviction with disciplined risk management — the same philosophy that underpins every trade idea we publish.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { k: "7+ Yrs", v: "Experience" },
                { k: "CFA", v: "Charterholder" },
                { k: "SEBI RA", v: "Registered" },
              ].map((s) => (
                <div key={s.k} className="rounded-lg border border-border bg-background/60 p-3 text-center">
                  <div className="font-bold text-primary">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { icon: Target, t: "Our Mission", d: "Deliver clear, research-backed trade ideas that respect your capital and your time." },
              { icon: ShieldCheck, t: "Our Promise", d: "Every recommendation comes with defined risk, clear targets and a documented thesis." },
              { icon: Users, t: "Who We Serve", d: "Retail traders, working professionals and serious investors who want professional research without conflicts of interest." },
            ].map((c) => (
              <div key={c.t} className="flex gap-4 rounded-xl border border-border bg-surface p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-primary/40">
                  <c.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold">{c.t}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{c.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
