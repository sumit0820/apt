import { apiJson, apiServerError } from "@/lib/api-response";
import { connectDb } from "@/lib/mongodb";
import { handleOptions } from "@/lib/request";
import { serializeTrade } from "@/lib/trade-serializer";
import { PastTrade } from "@/models/PastTrade";

export async function OPTIONS() {
  return handleOptions();
}

/** Public list of published past trades — no auth required. */
export async function GET() {
  try {
    await connectDb();
    const rows = await PastTrade.find({ published: true })
      .sort({ tradeDate: -1 })
      .lean();
    return apiJson({ trades: rows.map((r) => serializeTrade(r)) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
