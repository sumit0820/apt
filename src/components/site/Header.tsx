import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, User } from "lucide-react";
import { Logo } from "./Logo";
import { useActiveSection } from "@/hooks/use-active-section";

const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "strategies", label: "Strategies" },
  { id: "how-it-works", label: "How It Works" },
  { id: "about", label: "About Us" },
  { id: "performance", label: "Performance" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact Us" },
];

type HeaderProps = {
  /** Auth pages: logo only, links home */
  logoOnly?: boolean;
};

export function Header({ logoOnly = false }: HeaderProps) {
  const active = useActiveSection(SECTIONS.map((s) => s.id));
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (logoOnly) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [logoOnly]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 overflow-x-clip transition-all ${
        logoOnly || scrolled
          ? "bg-background/85 backdrop-blur-lg border-b border-border"
          : "bg-background/40 backdrop-blur-sm"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 ${
          logoOnly ? "justify-start" : "justify-between"
        }`}
      >
        <Link to="/" aria-label="Apex Pro Traders home" className="min-w-0 shrink">
          <Logo size="sm" />
        </Link>

        {!logoOnly && (
          <>
            <nav className="hidden lg:flex items-center gap-7">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`relative text-sm font-medium transition-colors hover:text-primary ${
                    active === s.id ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {s.label}
                  {active === s.id && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
                  )}
                </a>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-surface"
              >
                <User className="h-4 w-4" /> Login
              </Link>
              <Link
                to="/auth/signup"
                className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-[0_0_20px_-6px_var(--gold)] hover:brightness-110"
              >
                Get Started
              </Link>
            </div>

            <button
              className="lg:hidden p-2"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        )}
      </div>

      {!logoOnly && open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur">
          <div className="px-4 py-4 flex flex-col gap-2">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className={`py-2 text-sm font-medium ${active === s.id ? "text-primary" : "text-foreground/80"}`}
              >
                {s.label}
              </a>
            ))}
            <div className="flex gap-2 pt-2">
              <Link to="/auth/login" className="flex-1 rounded-md border border-border px-4 py-2 text-sm text-center">Login</Link>
              <Link to="/auth/signup" className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground text-center">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
