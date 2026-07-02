import logoUrl from "@/assets/apt-logo.png";
import { cn } from "@/lib/utils";

type LogoProps = {
  /** default = full 3× mark; sm = compact header/footer */
  size?: "default" | "sm";
  className?: string;
};

export function Logo({ size = "default", className }: LogoProps) {
  const compact = size === "sm";

  return (
    <div
      className={cn(
        "flex items-center",
        compact ? "gap-2 sm:gap-2.5" : "gap-3 sm:gap-4",
        className,
      )}
      aria-label="Apex Pro Traders — Research. Strategy. Edge."
    >
      <img
        src={logoUrl}
        alt=""
        aria-hidden
        className={cn(
          "w-auto shrink-0 object-contain",
          compact ? "h-[5.25rem] sm:h-[5.25rem]" : "h-[6.3rem] sm:h-[7.35rem]",
        )}
      />
      <div
        className={cn(
          "flex items-stretch",
          compact ? "gap-2 sm:gap-2.5" : "gap-2.5 sm:gap-3",
        )}
      >
        <span aria-hidden className="w-px shrink-0 bg-foreground/30" />
        <div
          className={cn(
            "flex min-w-0 flex-col justify-center leading-none",
            compact ? "gap-1.5" : "gap-1.5 sm:gap-2",
          )}
        >
          <span
            className={cn(
              "font-bold uppercase tracking-[0.14em] text-foreground whitespace-nowrap",
              compact ? "text-[10px] sm:text-[11px]" : "text-sm sm:text-base md:text-lg",
            )}
          >
            Apex Pro Traders
          </span>
          <span
            className={cn(
              "font-semibold uppercase tracking-[0.2em] text-primary whitespace-nowrap",
              compact ? "text-[8px] sm:text-[9px]" : "text-xs sm:text-sm",
            )}
          >
            Research. Strategy. Edge.
          </span>
        </div>
      </div>
    </div>
  );
}
