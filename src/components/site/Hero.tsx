import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, User, TrendingUp, ShieldCheck } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";
import { HeroPromoPanel } from "./HeroPromoPanel";

export function Hero() {
  return (
    <section id="home" className="relative bg-background lg:min-h-svh">
      <div className="relative mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 lg:min-h-svh lg:px-10">
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          <img
            src={heroBg}
            alt=""
            className="hero-bg-zoom absolute inset-0 h-full w-full object-cover object-[88%_center] sm:object-[72%_center] contrast-125 brightness-110 saturate-110"
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/92 via-background/72 to-background/35 lg:from-background/88 lg:via-background/52 lg:to-background/25"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,var(--gold-soft),transparent_55%)]"
        />

        <div className="relative z-10 flex flex-col pt-[80px] pb-10 lg:min-h-svh lg:pb-12">
          <div className="grid w-full min-w-0 items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="min-w-0 max-w-2xl lg:max-w-xl">
              <div className="hero-animate hero-delay-1 inline-flex max-w-full flex-wrap items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-[10px] font-bold tracking-wide text-primary shadow-[0_0_20px_-6px_var(--gold)] sm:text-xs">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> SEBI REGISTERED RESEARCH ANALYST
              </div>

              <h1 className="hero-animate hero-delay-2 mt-5 text-balance text-[1.65rem] font-extrabold leading-[1.15] tracking-tight sm:mt-6 sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
                Precision Research.<br />
                Powerful Opportunities.<br />
                Returns on <span className="hero-gold-text text-primary">Both Sides.</span>
              </h1>

              <div className="hero-animate hero-delay-3 mt-5 max-w-lg border-l-2 border-primary pl-4 text-sm text-muted-foreground sm:mt-6 sm:text-base">
                <p>
                  We deliver research-backed trade ideas across Equity, Derivatives, F&O and Commodities.
                </p>
                <p className="mt-1">
                  We view the market from both sides — Bull &amp; Bear — so you get opportunities, no matter the direction.
                </p>
              </div>

              <div className="hero-animate hero-delay-4 mt-6 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="hero-stat-card flex min-w-0 items-center gap-3 rounded-lg border border-transparent p-1 transition-colors hover:border-primary/20 hover:bg-surface/40">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-background/60 sm:h-11 sm:w-11">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-primary">Dhairya Mehta, CFA</div>
                    <div className="text-xs text-muted-foreground">Founder &amp; Research Head</div>
                    <div className="text-xs text-muted-foreground">CFA Charterholder</div>
                  </div>
                </div>
                <div className="hero-stat-card flex min-w-0 items-center gap-3 rounded-lg border border-transparent p-1 transition-colors hover:border-primary/20 hover:bg-surface/40">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-background/60 sm:h-11 sm:w-11">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-primary">7+ Years</div>
                    <div className="text-xs text-muted-foreground">of Market Experience</div>
                    <div className="text-xs text-muted-foreground">Across Cycles</div>
                  </div>
                </div>
              </div>

              <div className="hero-animate hero-delay-5 mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
                <Link
                  to="/auth/signup"
                  className="hero-cta-primary inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground shadow-[0_0_30px_-8px_var(--gold)] transition-transform hover:scale-[1.02] hover:brightness-110 sm:w-auto"
                >
                  <ArrowRight className="h-4 w-4" /> Join Us Now
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-6 py-3 font-semibold transition-all hover:scale-[1.02] hover:border-primary/40 hover:bg-surface-2 sm:w-auto"
                >
                  <Play className="h-4 w-4" /> How It Works
                </a>
              </div>
            </div>

            <div className="hero-animate hero-delay-6 hidden w-full min-w-0 justify-center lg:flex lg:self-end">
              <HeroPromoPanel />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
