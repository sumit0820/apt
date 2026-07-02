import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planCatalogId: { type: Schema.Types.ObjectId, ref: "PlanCatalog", required: true },
    razorpaySubscriptionId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["created", "authenticated", "active", "paused", "halted", "cancelled", "completed", "expired"],
      default: "created",
    },
    currentStart: { type: Date, default: null },
    currentEnd: { type: Date, default: null },
    cancelAtCycleEnd: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type ISubscription = InferSchemaType<typeof subscriptionSchema> & { _id: mongoose.Types.ObjectId };

export const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ?? mongoose.model<ISubscription>("Subscription", subscriptionSchema);
