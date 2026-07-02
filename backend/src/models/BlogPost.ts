import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const blogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    tag: { type: String, required: true, trim: true, maxlength: 40 },
    excerpt: { type: String, required: true, trim: true, maxlength: 500 },
    content: { type: String, trim: true, maxlength: 12000, default: "" },
    publishedAt: { type: Date, required: true, index: true },
    published: { type: Boolean, default: true, index: true },
    slug: { type: String, trim: true, maxlength: 180, unique: true, sparse: true },
  },
  { timestamps: true },
);

export type IBlogPost = InferSchemaType<typeof blogPostSchema> & { _id: mongoose.Types.ObjectId };

export const BlogPost: Model<IBlogPost> =
  mongoose.models.BlogPost ?? mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
