import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const contactMessageSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true },
);

export type IContactMessage = InferSchemaType<typeof contactMessageSchema> & { _id: mongoose.Types.ObjectId };

export const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ?? mongoose.model<IContactMessage>("ContactMessage", contactMessageSchema);
