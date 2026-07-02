import { apiError, apiJson, apiServerError, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { serializeTrade } from "@/lib/trade-serializer";
import { pastTradeSchema } from "@/lib/validators";
import { PastTrade } from "@/models/PastTrade";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    await connectDb();
    const rows = await PastTrade.find().sort({ tradeDate: -1 }).lean();
    return apiJson({ trades: rows.map((r) => serializeTrade(r)) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const body = await parseJson<unknown>(request as never);
    const parsed = pastTradeSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    const tradeDate = new Date(parsed.data.tradeDate);
    if (Number.isNaN(tradeDate.getTime())) return apiError("Invalid trade date");

    await connectDb();
    const row = await PastTrade.create({ ...parsed.data, tradeDate });
    return apiJson({ trade: serializeTrade(row) }, 201);
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
