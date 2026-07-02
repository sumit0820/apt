import { apiError, apiJson, apiServerError, notFound, withCors } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/mongodb";
import { handleOptions, parseJson } from "@/lib/request";
import { serializeTrade } from "@/lib/trade-serializer";
import { pastTradeUpdateSchema } from "@/lib/validators";
import { PastTrade } from "@/models/PastTrade";

type Params = { params: Promise<{ id: string }> };

export async function OPTIONS() {
  return handleOptions();
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const { id } = await params;
    const body = await parseJson<unknown>(request as never);
    const parsed = pastTradeUpdateSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid input");

    await connectDb();
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.tradeDate) {
      const tradeDate = new Date(parsed.data.tradeDate);
      if (Number.isNaN(tradeDate.getTime())) return apiError("Invalid trade date");
      updates.tradeDate = tradeDate;
    }

    const row = await PastTrade.findByIdAndUpdate(id, updates, { new: true });
    if (!row) return notFound("Trade not found");

    return apiJson({ trade: serializeTrade(row) });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const auth = await requireAdmin(request as never);
    if (auth instanceof Response) return withCors(auth);

    const { id } = await params;
    await connectDb();
    const row = await PastTrade.findByIdAndDelete(id);
    if (!row) return notFound("Trade not found");

    return apiJson({ ok: true });
  } catch (err) {
    console.error(err);
    return apiServerError();
  }
}
