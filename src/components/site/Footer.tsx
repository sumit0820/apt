import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size="sm" />
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Apex Pro Traders is a SEBI Registered Research Analyst firm.
              SEBI RA Reg. No. <span className="text-primary font-semibold">INH000019460</span>.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-primary">About</a></li>
              <li><a href="#strategies" className="hover:text-primary">Strategies</a></li>
              <li><a href="#performance" className="hover:text-primary">Performance</a></li>
              <li><a href="#blog" className="hover:text-primary">Blog</a></li>
              <li><a href="#contact" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms &amp; Conditions</Link></li>
              <li><Link to="/auth/login" className="hover:text-primary">Login</Link></li>
              <li><Link to="/auth/signup" className="hover:text-primary">Sign up</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-border" />
        <p className="text-xs text-muted-foreground text-center max-w-3xl mx-auto">
          Investments in securities market are subject to market risks. Read all related documents carefully before investing.
          Past performance is not indicative of future results. Apex Pro Traders provides research and trade ideas only — you are
          responsible for your investment decisions and trade execution.
        </p>
        <p className="mt-4 text-xs text-muted-foreground text-center">© {new Date().getFullYear()} Apex Pro Traders. All rights reserved.</p>
      </div>
    </footer>
  );
}
