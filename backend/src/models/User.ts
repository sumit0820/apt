import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, default: null },
    phone: { type: String, default: null },
    panNumber: { type: String, default: null },
    planId: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending",
    },
    subscriptionStartedAt: { type: Date, default: null },
    subscriptionExpiresAt: { type: Date, default: null },
    roles: { type: [String], enum: ["admin", "user"], default: ["user"] },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    whatsappRemovedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type IUser = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export type IUserDoc = IUser & { id: string };

export const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
