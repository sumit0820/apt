import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ClipboardCheck, Target, ShieldCheck, User, CheckCircle2, ArrowRight, Info, Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { directionClass, formatTradeDate } from "@/lib/trades";
import { SectionHeader } from "./Strategies";

const FEATURES = [
  { icon: ClipboardCheck, title: "Research Led", desc: "All ideas are backed by detailed analysis and market understanding." },
  { icon: Target, title: "Risk Defined", desc: "Every recommendation comes with clear risk management levels." },
  { icon: ShieldCheck, title: "Discipline First", desc: "We focus on process, probability and disciplined execution." },
  { icon: User, title: "You Execute", desc: "Clients execute trades in their own accounts as per their risk appetite." },
];

export function TradeInsights() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["trades", "public"],
    queryFn: () => api.trades.list(),
  });

  const trades = data?.trades ?? [];

  return (
    <section id="performance" className="py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="TRADE INSIGHTS"
          title="Sample Trade Insights"
          subtitle="Below are select examples of research-based trade ideas shared with our clients. These are for informational purposes only and do not represent the complete performance."
        />
        <p className="text-center text-primary text-xl sm:text-2xl font-bold italic mt-2">Illustrative Examples of Our Research.</p>

        <div className="mt-10 rounded-2xl border border-border bg-surface p-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-primary/40 shrink-0">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-bold">{f.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Recent Trade Examples</h3>
                <p className="text-xs text-muted-foreground mt-1">Examples of trade ideas shared with our clients across different strategies.</p>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-10 flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Loading trade examples…</p>
              </div>
            ) : isError ? (
              <p className="mt-8 text-sm text-destructive">Could not load trade examples. Please try again later.</p>
            ) : trades.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No trade examples published yet.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground border-b border-border">
                    <tr>
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Strategy</th>
                      <th className="py-2 pr-3">Instrument</th>
                      <th className="py-2 pr-3">Direction</th>
                      <th className="py-2 pr-3">Entry</th>
                      <th className="py-2 pr-3">Exit</th>
                      <th className="py-2">Outcome</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t) => (
                      <tr key={t.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-3 whitespace-nowrap">{formatTradeDate(t.tradeDate)}</td>
                        <td className="py-3 pr-3 text-primary whitespace-nowrap">{t.strategy} Strategy</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{t.instrument}</td>
                        <td className={`py-3 pr-3 ${directionClass(t.direction)}`}>{t.direction}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{t.entry}</td>
                        <td className="py-3 pr-3 whitespace-nowrap">{t.exit}</td>
                        <td className="py-3 text-bull font-semibold">{t.outcome}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <span>The above examples are for informational purposes only and do not represent complete performance. <span className="text-primary">Past outcomes are not indicative of future results.</span></span>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="text-lg font-bold text-primary">Key Note</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                "All trade ideas are shared as research and not as investment advice.",
                "We do not provide any assured returns or guarantees.",
                "Investments in securities market are subject to market risks.",
                "Please read all related documents carefully before investing.",
              ].map((n) => (
                <li key={n} className="flex gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" /> <span className="text-muted-foreground">{n}</span>
                </li>
              ))}
            </ul>
            <Link to="/terms" className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 font-semibold text-primary-foreground hover:brightness-110">
              <Download className="h-4 w-4" /> Read Full Disclaimer
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-primary/30 bg-surface p-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full border border-primary/40 shrink-0">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold">Research. Discipline. Consistency.</h4>
            <p className="text-sm text-muted-foreground">Our focus is on delivering high-quality research and actionable trade ideas to help you make informed decisions.</p>
          </div>
          <a href="#strategies" className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-bold text-primary-foreground hover:brightness-110">
            Explore Our Strategies <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
