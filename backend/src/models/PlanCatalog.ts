import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const planCatalogSchema = new Schema(
  {
    planKey: { type: String, required: true },
    durationMonths: { type: Number, required: true, enum: [3, 6, 12] },
    priceInr: { type: Number, required: true },
    razorpayPlanId: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

planCatalogSchema.index({ planKey: 1, durationMonths: 1 }, { unique: true });

export type IPlanCatalog = InferSchemaType<typeof planCatalogSchema> & { _id: mongoose.Types.ObjectId };

export const PlanCatalog: Model<IPlanCatalog> =
  mongoose.models.PlanCatalog ?? mongoose.model<IPlanCatalog>("PlanCatalog", planCatalogSchema);
