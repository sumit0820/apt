import { ShieldCheck } from "lucide-react";

export function HeroPromoPanel() {
  return (
    <div className="flex w-full flex-col items-center text-center lg:ml-[5%] lg:translate-y-[10%]">
      <div className="w-full max-w-[18.2rem] rounded-lg border border-border/80 bg-surface/90 backdrop-blur-sm px-3 py-2.5 sm:px-2.5 sm:py-2.5 hero-promo-card">
        <div className="flex items-center gap-2 text-left">
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10">
            <ShieldCheck className="h-3 w-3 text-primary" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[10px] text-muted-foreground">SEBI RA Registration No.</p>
            <p className="text-sm sm:text-base font-bold tracking-wide text-primary">INH000019460</p>
            <p className="text-[9px] sm:text-[9px] text-muted-foreground leading-snug">
              (Under SEBI Research Analyst Regulations)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
