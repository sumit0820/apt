import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, User, TrendingUp, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import { HeroPromoPanel } from "./HeroPromoPanel";

export function Hero() {
  return (
    <section id="home" className="relative min-h-svh bg-background">
      <div className="relative mx-auto min-h-svh max-w-7xl overflow-hidden px-4 sm:px-6 lg:px-10">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <img
            src={heroBg}
            alt=""
            className="hero-bg-zoom absolute inset-0 h-full w-full object-cover object-[72%_center] contrast-125 brightness-110 saturate-110"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/88 via-background/52 to-background/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,var(--gold-soft),transparent_55%)]"
        />

        <div className="relative z-10 flex min-h-svh flex-col pt-24 pb-10 lg:pt-28 lg:pb-12">
          <div className="grid w-full items-start gap-10 lg:grid-cols-2 lg:items-end lg:gap-12 xl:gap-16">
            <div className="max-w-2xl lg:max-w-xl">
              <div className="hero-animate hero-delay-1 inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold tracking-wide text-primary shadow-[0_0_20px_-6px_var(--gold)]">
                <ShieldCheck className="h-3.5 w-3.5" /> SEBI REGISTERED RESEARCH ANALYST
              </div>

              <h1 className="hero-animate hero-delay-2 mt-6 text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-extrabold leading-[1.15] tracking-tight whitespace-nowrap">
                Precision Research.<br />
                Powerful Opportunities.<br />
                Returns on <span className="hero-gold-text text-primary">Both Sides.</span>
              </h1>

              <div className="hero-animate hero-delay-3 mt-6 max-w-lg border-l-2 border-primary pl-4 text-muted-foreground">
                <p>
                  We deliver research-backed trade ideas across Equity, Derivatives, F&O and Commodities.
                </p>
                <p className="mt-1">
                  We view the market from both sides — Bull &amp; Bear — so you get opportunities, no matter the direction.
                </p>
              </div>

              <div className="hero-animate hero-delay-4 mt-7 grid max-w-lg grid-cols-2 gap-4">
                <div className="hero-stat-card flex items-center gap-3 rounded-lg border border-transparent p-1 transition-colors hover:border-primary/20 hover:bg-surface/40">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-background/60">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">Dhairya Mehta, CFA</div>
                    <div className="text-xs text-muted-foreground">Founder &amp; Research Head</div>
                    <div className="text-xs text-muted-foreground">CFA Charterholder</div>
                  </div>
                </div>
                <div className="hero-stat-card flex items-center gap-3 rounded-lg border border-transparent p-1 transition-colors hover:border-primary/20 hover:bg-surface/40">
                  <div className="grid h-11 w-11 place-items-center rounded-full border border-primary/40 bg-background/60">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">7+ Years</div>
                    <div className="text-xs text-muted-foreground">of Market Experience</div>
                    <div className="text-xs text-muted-foreground">Across Cycles</div>
                  </div>
                </div>
              </div>

              <div className="hero-animate hero-delay-5 mt-8 flex flex-wrap gap-3">
                <Link
                  to="/auth/signup"
                  className="hero-cta-primary inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_0_30px_-8px_var(--gold)] transition-transform hover:scale-[1.02] hover:brightness-110"
                >
                  <ArrowRight className="h-4 w-4" /> Join Us Now
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-3 font-semibold transition-all hover:scale-[1.02] hover:border-primary/40 hover:bg-surface-2"
                >
                  <Play className="h-4 w-4" /> How It Works
                </a>
              </div>
            </div>

            <div className="hero-animate hero-delay-6 flex w-full justify-center">
              <HeroPromoPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
