import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const pastTradeSchema = new Schema(
  {
    tradeDate: { type: Date, required: true, index: true },
    strategy: {
      type: String,
      enum: ["Income", "Growth", "Diversified"],
      required: true,
    },
    instrument: { type: String, required: true, trim: true, maxlength: 120 },
    direction: { type: String, enum: ["Long", "Short"], required: true },
    entry: { type: String, required: true, trim: true, maxlength: 80 },
    exit: { type: String, required: true, trim: true, maxlength: 80 },
    outcome: { type: String, default: "Completed", trim: true, maxlength: 40 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type IPastTrade = InferSchemaType<typeof pastTradeSchema> & { _id: mongoose.Types.ObjectId };

export const PastTrade: Model<IPastTrade> =
  mongoose.models.PastTrade ?? mongoose.model<IPastTrade>("PastTrade", pastTradeSchema);
