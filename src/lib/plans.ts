export type Plan = {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number; // INR per month
  features: string[];
  accent: "bull" | "bear";
};

export const PLANS: Plan[] = [
  {
    id: "plan-1",
    name: "Plan 1 — Income",
    tagline: "Buying Strategies",
    monthlyPrice: 2000,
    features: [
      "Options Buying (CE / PE)",
      "Equity Swing & Positional Buys",
      "Defined Risk & Capital Protection",
      "Ideal for Consistent Monthly Income",
    ],
    accent: "bull",
  },
  {
    id: "plan-2",
    name: "Plan 2 — Growth",
    tagline: "Selling & Hedging Strategies",
    monthlyPrice: 3000,
    features: [
      "Options Selling (CE / PE)",
      "Spreads & Hedging Techniques",
      "Trend & Momentum Based Setups",
      "Designed for Higher Growth Potential",
    ],
    accent: "bear",
  },
];

export const DURATIONS = [3, 6, 12] as const;
export type Duration = (typeof DURATIONS)[number];

export const getPlan = (id: string) => PLANS.find((p) => p.id === id);
export const planTotal = (monthlyPrice: number, months: number) => monthlyPrice * months;
export const getPlanPrice = (
  planKey: string,
  durationMonths: number,
  catalog: Array<{ planKey: string; durationMonths: number; priceInr: number }>,
) => {
  const row = catalog.find((p) => p.planKey === planKey && p.durationMonths === durationMonths);
  if (row) return row.priceInr;
  const plan = getPlan(planKey);
  return plan ? planTotal(plan.monthlyPrice, durationMonths) : 0;
};
