import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, XCircle, TrendingUp, TrendingDown, Coins, User, Target, MessageCircle, Users } from "lucide-react";
import strategyBull from "@/assets/strategy-bull.png";
import strategyBear from "@/assets/strategy-bear.png";
import { useInView } from "@/hooks/useInView";



export function Strategies() {
  const income = useInView<HTMLElement>();
  const growth = useInView<HTMLElement>();
  return (
    <section id="strategies" className="py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="OUR STRATEGIES"
          title="Two Strategies. Two Approaches. One Goal."
          subtitle="Choose the strategy that aligns with your capital, goals, and risk appetite. All strategies are backed by research, discipline, and risk management."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-6 items-stretch">
          {/* Income */}
          <article
            ref={income.ref}
            className={`group relative overflow-hidden rounded-2xl border border-bull/30 bg-surface transition-all duration-700 ease-out h-full flex flex-col ${income.inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-16"}`}
          >

            <div className="absolute inset-0 opacity-60 group-hover:opacity-80 transition">
              <img src={strategyBull} alt="" loading="lazy" width={1920} height={1080} className="h-full w-full object-cover object-left" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-surface/70 to-surface/95" />
            </div>
            <div className="relative p-7 lg:pl-72 flex flex-col h-full flex-1">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-9 w-9 text-bull" />
                <div>
                  <h3 className="text-2xl font-bold">Income Strategy</h3>
                  <p className="text-xs font-bold tracking-wider text-bull">BUYING STRATEGIES</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">
                Focused on capital preservation and steady returns through options buying and equity buying strategies.
              </p>
              <hr className="my-5 border-border" />
              <ul className="space-y-2.5 text-sm">
                {["Options Buying (CE / PE)", "Equity Swing & Positional Buys", "Defined Risk & Capital Protection", "Ideal for Consistent Monthly Income"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-bull shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mt-[15px] w-full px-7">
              <div className="ml-auto flex w-[70%] justify-between gap-4 rounded-lg border border-border bg-background/80 p-[10px]">
                <div className="flex shrink-0 items-center gap-2">
                  <Coins className="h-6 w-6 shrink-0 text-bull" />
                  <div>
                    <div className="whitespace-nowrap text-[10px] tracking-wider text-muted-foreground">MIN. CAPITAL</div>
                    <div className="whitespace-nowrap font-bold">₹5 Lakh+</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <User className="h-6 w-6 shrink-0 text-bull" />
                  <div>
                    <div className="whitespace-nowrap text-[10px] tracking-wider text-muted-foreground">BEST SUITED FOR</div>
                    <div className="whitespace-nowrap font-bold text-bull text-sm">Conservative to Moderate</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full px-7 pb-7 pt-4">
              <Link
                to="/auth/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-bull/60 px-4 py-3 font-semibold text-bull hover:bg-bull/10"
              >
                View Income Strategy Details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>

          {/* Growth */}
          <article
            ref={growth.ref}
            className={`group relative overflow-hidden rounded-2xl border border-bear/30 bg-surface transition-all duration-700 ease-out h-full flex flex-col ${growth.inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"}`}
          >

            <div className="absolute inset-0 opacity-60 group-hover:opacity-80 transition">
              <img src={strategyBear} alt="" loading="lazy" width={1920} height={1080} className="h-full w-full object-cover object-right" />
              <div className="absolute inset-0 bg-gradient-to-r from-surface/95 via-surface/70 to-transparent" />
            </div>
            <div className="relative p-7 lg:pr-72 flex flex-col h-full flex-1">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-9 w-9 text-bear" />
                <div>
                  <h3 className="text-2xl font-bold">Growth Strategy</h3>
                  <p className="text-xs font-bold tracking-wider text-bear">SELLING &amp; HEDGING STRATEGIES</p>
                </div>
              </div>
              <p className="mt-4 text-muted-foreground">
                Focused on capturing high-growth opportunities using options selling and hedging strategies.
              </p>
              <hr className="my-5 border-border" />
              <ul className="space-y-2.5 text-sm">
                {["Options Selling (CE / PE)", "Spreads & Hedging Techniques", "Trend & Momentum Based Setups", "Designed for Higher Growth Potential"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-bear shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative mt-[15px] w-full px-7">
              <div className="flex w-[70%] justify-between gap-4 rounded-lg border border-border bg-background/80 p-[10px]">
                <div className="flex shrink-0 items-center gap-2">
                  <Coins className="h-6 w-6 shrink-0 text-bear" />
                  <div>
                    <div className="whitespace-nowrap text-[10px] tracking-wider text-muted-foreground">MIN. CAPITAL</div>
                    <div className="whitespace-nowrap font-bold">₹10 Lakh+</div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Target className="h-6 w-6 shrink-0 text-bear" />
                  <div>
                    <div className="whitespace-nowrap text-[10px] tracking-wider text-muted-foreground">INVESTOR CAN EXPECT</div>
                    <div className="whitespace-nowrap font-bold text-bear text-sm">2% – 5% / Month*</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative w-full px-7 pb-7 pt-4">
              <Link
                to="/auth/signup"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-bear/60 px-4 py-3 font-semibold text-bear hover:bg-bear/10"
              >
                View Growth Strategy Details <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </article>
        </div>

        {/* CTA strip */}
        <div className="mt-8 rounded-2xl border border-primary/30 bg-surface p-6 grid md:grid-cols-3 gap-4 items-center">
          <div className="flex items-start gap-4">
            <Users className="h-10 w-10 text-primary shrink-0" />
            <div>
              <h4 className="text-xl font-bold">Ready to get started?</h4>
              <p className="text-sm text-muted-foreground">Our strategies are built for real market conditions. Let our team help you choose the right fit.</p>
            </div>
          </div>
          <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer"
             className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:brightness-110">
            <MessageCircle className="h-4 w-4" /> Join Us Now
          </a>
          <a href="#contact" className="flex items-center justify-center gap-2 rounded-md border border-primary/40 px-5 py-3 font-bold text-primary hover:bg-primary/10">
            <MessageCircle className="h-4 w-4" /> Talk to Our Team
          </a>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.25em] text-primary">
        <span className="h-px w-8 bg-primary" /> {eyebrow} <span className="h-px w-8 bg-primary" />
      </div>
      <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
