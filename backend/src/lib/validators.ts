import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(20),
  planId: z.string().optional(),
  panNumber: z.string().trim().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const profileUpdateSchema = z.object({
  panNumber: z.string().trim().max(20).optional(),
  phone: z.string().trim().min(7).max(20).optional(),
  fullName: z.string().trim().min(2).max(80).optional(),
});

export const createSubscriptionSchema = z.object({
  planKey: z.string(),
  durationMonths: z.number().int().refine((v) => [3, 6, 12].includes(v)),
});

export const verifySubscriptionSchema = z.object({
  subscriptionId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
});

export const cancelSubscriptionSchema = z.object({
  atCycleEnd: z.boolean().default(true),
});

export const changeSubscriptionSchema = z.object({
  planKey: z.string(),
  durationMonths: z.number().int(),
  immediate: z.boolean().default(false),
});

export const adminAddUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(80),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(1000),
});

export const pastTradeSchema = z.object({
  tradeDate: z.string().min(1),
  strategy: z.enum(["Income", "Growth", "Diversified"]),
  instrument: z.string().trim().min(1).max(120),
  direction: z.enum(["Long", "Short"]),
  entry: z.string().trim().min(1).max(80),
  exit: z.string().trim().min(1).max(80),
  outcome: z.string().trim().min(1).max(40).default("Completed"),
  published: z.boolean().default(true),
});

export const pastTradeUpdateSchema = pastTradeSchema.partial();

const testimonialBaseSchema = z.object({
  name: z.string().trim().min(2).max(80),
  content: z.string().trim().min(10).max(2000),
  mediaType: z.enum(["none", "image", "video"]).default("none"),
  mediaUrl: z.string().trim().max(500).optional().nullable().or(z.literal("")),
  published: z.boolean().default(true),
});

export const testimonialSchema = testimonialBaseSchema.superRefine((data, ctx) => {
  if (data.mediaType !== "none" && !data.mediaUrl?.trim()) {
    ctx.addIssue({ code: "custom", message: "Media URL is required for image or video", path: ["mediaUrl"] });
  }
});

export const testimonialUpdateSchema = testimonialBaseSchema.partial().superRefine((data, ctx) => {
  if (data.mediaType && data.mediaType !== "none" && !data.mediaUrl?.trim()) {
    ctx.addIssue({ code: "custom", message: "Media URL is required for image or video", path: ["mediaUrl"] });
  }
});

export const blogPostSchema = z.object({
  title: z.string().trim().min(4).max(160),
  tag: z.string().trim().min(2).max(40),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().max(12000).optional().or(z.literal("")),
  publishedAt: z.string().min(1),
  published: z.boolean().default(true),
  slug: z.string().trim().max(180).optional().nullable().or(z.literal("")),
});

export const blogPostUpdateSchema = blogPostSchema.partial();
