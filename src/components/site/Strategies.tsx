import { forwardRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, XCircle, TrendingUp, TrendingDown, Coins, User, Target, MessageCircle, Users } from "lucide-react";
import strategyBull from "@/assets/strategy-bull.png";
import strategyBear from "@/assets/strategy-bear.png";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

export function Strategies() {
  const income = useInView<HTMLElement>();
  const growth = useInView<HTMLElement>();

  return (
    <section id="strategies" className="overflow-x-clip py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="OUR STRATEGIES"
          title="Two Strategies. Two Approaches. One Goal."
          subtitle="Choose the strategy that aligns with your capital, goals, and risk appetite. All strategies are backed by research, discipline, and risk management."
        />

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
          <StrategyCard
            ref={income.ref}
            visible={income.inView}
            slideFrom="left"
            borderClass="border-bull/30"
            image={strategyBull}
            imagePosition="object-left"
            desktopGradient="from-transparent via-surface/70 to-surface/95"
            icon={TrendingUp}
            iconClass="text-bull"
            title="Income Strategy"
            subtitle="BUYING STRATEGIES"
            subtitleClass="text-bull"
            description="Focused on capital preservation and steady returns through options buying and equity buying strategies."
            features={[
              "Options Buying (CE / PE)",
              "Equity Swing & Positional Buys",
              "Defined Risk & Capital Protection",
              "Ideal for Consistent Monthly Income",
            ]}
            featureIcon={CheckCircle2}
            featureIconClass="text-bull"
            stats={[
              { icon: Coins, iconClass: "text-bull", label: "MIN. CAPITAL", value: "₹5 Lakh+" },
              { icon: User, iconClass: "text-bull", label: "BEST SUITED FOR", value: "Conservative to Moderate", valueClass: "text-bull text-sm" },
            ]}
            statsAlign="right"
            ctaClass="border-bull/60 text-bull hover:bg-bull/10"
            ctaLabel="View Income Strategy Details"
            contentPadding="lg:pl-72"
          />

          <StrategyCard
            ref={growth.ref}
            visible={growth.inView}
            slideFrom="right"
            borderClass="border-bear/30"
            image={strategyBear}
            imagePosition="object-right"
            desktopGradient="from-surface/95 via-surface/70 to-transparent"
            icon={TrendingDown}
            iconClass="text-bear"
            title="Growth Strategy"
            subtitle="SELLING & HEDGING STRATEGIES"
            subtitleClass="text-bear"
            description="Focused on capturing high-growth opportunities using options selling and hedging strategies."
            features={[
              "Options Selling (CE / PE)",
              "Spreads & Hedging Techniques",
              "Trend & Momentum Based Setups",
              "Designed for Higher Growth Potential",
            ]}
            featureIcon={XCircle}
            featureIconClass="text-bear"
            stats={[
              { icon: Coins, iconClass: "text-bear", label: "MIN. CAPITAL", value: "₹10 Lakh+" },
              { icon: Target, iconClass: "text-bear", label: "INVESTOR CAN EXPECT", value: "2% – 5% / Month*", valueClass: "text-bear text-sm" },
            ]}
            statsAlign="left"
            ctaClass="border-bear/60 text-bear hover:bg-bear/10"
            ctaLabel="View Growth Strategy Details"
            contentPadding="lg:pr-72"
          />
        </div>

        <div className="mt-8 grid gap-4 rounded-2xl border border-primary/30 bg-surface p-5 sm:p-6 md:grid-cols-3 md:items-center">
          <div className="flex items-start gap-4">
            <Users className="h-10 w-10 shrink-0 text-primary" />
            <div className="min-w-0">
              <h4 className="text-lg font-bold sm:text-xl">Ready to get started?</h4>
              <p className="text-sm text-muted-foreground">Our strategies are built for real market conditions. Let our team help you choose the right fit.</p>
            </div>
          </div>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" /> Join Us Now
          </a>
          <a
            href="#contact"
            className="flex w-full items-center justify-center gap-2 rounded-md border border-primary/40 px-5 py-3 font-bold text-primary hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4" /> Talk to Our Team
          </a>
        </div>
      </div>
    </section>
  );
}

type StrategyCardProps = {
  visible: boolean;
  slideFrom: "left" | "right";
  borderClass: string;
  image: string;
  imagePosition: string;
  desktopGradient: string;
  icon: typeof TrendingUp;
  iconClass: string;
  title: string;
  subtitle: string;
  subtitleClass: string;
  description: string;
  features: string[];
  featureIcon: typeof CheckCircle2;
  featureIconClass: string;
  stats: Array<{
    icon: typeof Coins;
    iconClass: string;
    label: string;
    value: string;
    valueClass?: string;
  }>;
  statsAlign: "left" | "right";
  ctaClass: string;
  ctaLabel: string;
  contentPadding: string;
};

const StrategyCard = forwardRef<HTMLElement, StrategyCardProps>(function StrategyCard(
  {
    visible,
    slideFrom,
    borderClass,
    image,
    imagePosition,
    desktopGradient,
    icon: Icon,
    iconClass,
    title,
    subtitle,
    subtitleClass,
    description,
    features,
    featureIcon: FeatureIcon,
    featureIconClass,
    stats,
    statsAlign,
    ctaClass,
    ctaLabel,
    contentPadding,
  },
  ref,
) {
  return (
    <article
      ref={ref}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-surface transition-all duration-700 ease-out",
        borderClass,
        visible ? "translate-x-0 opacity-100" : "opacity-0 max-lg:translate-x-0",
        !visible && slideFrom === "left" && "lg:-translate-x-16",
        !visible && slideFrom === "right" && "lg:translate-x-16",
      )}
    >
      <div className="relative h-36 w-full shrink-0 sm:h-44 lg:hidden">
        <img src={image} alt="" loading="lazy" width={1920} height={1080} className={cn("h-full w-full object-cover", imagePosition)} />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/70 to-transparent" />
      </div>

      <div className="absolute inset-0 hidden opacity-60 transition group-hover:opacity-80 lg:block">
        <img src={image} alt="" loading="lazy" width={1920} height={1080} className={cn("h-full w-full object-cover", imagePosition)} />
        <div className={cn("absolute inset-0 bg-gradient-to-r", desktopGradient)} />
      </div>

      <div className={cn("relative flex flex-1 flex-col bg-surface/95 p-5 sm:p-7 lg:bg-transparent", contentPadding)}>
        <div className="flex items-center gap-3">
          <Icon className={cn("h-8 w-8 shrink-0 sm:h-9 sm:w-9", iconClass)} />
          <div className="min-w-0">
            <h3 className="text-xl font-bold sm:text-2xl">{title}</h3>
            <p className={cn("text-xs font-bold tracking-wider", subtitleClass)}>{subtitle}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{description}</p>
        <hr className="my-5 border-border" />
        <ul className="space-y-2.5 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <FeatureIcon className={cn("mt-0.5 h-4 w-4 shrink-0", featureIconClass)} /> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-2 w-full px-5 sm:mt-[15px] sm:px-7">
        <div
          className={cn(
            "flex w-full flex-col gap-3 rounded-lg border border-border bg-background/90 p-3 sm:p-[10px] md:flex-row md:justify-between lg:w-[70%]",
            statsAlign === "right" && "lg:ml-auto",
          )}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex min-w-0 items-center gap-2">
              <stat.icon className={cn("h-6 w-6 shrink-0", stat.iconClass)} />
              <div className="min-w-0">
                <div className="text-[10px] tracking-wider text-muted-foreground">{stat.label}</div>
                <div className={cn("font-bold", stat.valueClass)}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full px-5 pb-5 pt-4 sm:px-7 sm:pb-7">
        <Link
          to="/auth/signup"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold sm:text-base",
            ctaClass,
          )}
        >
          {ctaLabel} <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>
    </article>
  );
});

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-1 text-center sm:px-0">
      <div className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] font-bold tracking-[0.12em] text-primary sm:gap-x-3 sm:text-xs sm:tracking-[0.2em] lg:tracking-[0.25em]">
        <span className="hidden h-px w-6 bg-primary sm:inline sm:w-8" /> {eyebrow}{" "}
        <span className="hidden h-px w-6 bg-primary sm:inline sm:w-8" />
      </div>
      <h2 className="mt-4 break-words text-2xl font-extrabold leading-tight sm:text-3xl lg:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
    </div>
  );
}
