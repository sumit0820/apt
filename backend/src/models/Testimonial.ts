import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const testimonialSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
    mediaType: { type: String, enum: ["none", "image", "video"], default: "none" },
    mediaUrl: { type: String, trim: true, maxlength: 500, default: null },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

export type ITestimonial = InferSchemaType<typeof testimonialSchema> & { _id: mongoose.Types.ObjectId };

export const Testimonial: Model<ITestimonial> =
  mongoose.models.Testimonial ?? mongoose.model<ITestimonial>("Testimonial", testimonialSchema);
