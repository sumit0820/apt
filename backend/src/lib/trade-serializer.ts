import type { IPastTrade } from "@/models/PastTrade";

export function serializeTrade(row: IPastTrade | Record<string, unknown>) {
  const r = row as IPastTrade;
  return {
    id: String(r._id),
    tradeDate: r.tradeDate instanceof Date ? r.tradeDate.toISOString() : String(r.tradeDate),
    strategy: r.strategy,
    instrument: r.instrument,
    direction: r.direction,
    entry: r.entry,
    exit: r.exit,
    outcome: r.outcome,
    published: r.published,
  };
}
