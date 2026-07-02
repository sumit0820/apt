import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(200),
  password: z.string().min(1, "Password is required"),
});

export const signupDetailsSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(80),
    email: z.string().trim().email("Enter a valid email").max(200),
    phone: z.string().trim().min(7, "Enter a valid phone").max(20),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
    pan: z.string().trim().max(20).optional().or(z.literal("")),
    agree: z.boolean().refine((v) => v, { message: "You must accept the terms" }),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

export const addUserSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80),
  email: z.string().trim().email("Enter a valid email").max(200),
  password: z.string().min(8, "At least 8 characters"),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80),
  phone: z.string().trim().min(7, "Enter a valid phone").max(20).optional().or(z.literal("")),
  panNumber: z.string().trim().max(20).optional().or(z.literal("")),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupDetailsFormValues = z.infer<typeof signupDetailsSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
export type AddUserFormValues = z.infer<typeof addUserSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;

export const pastTradeSchema = z.object({
  tradeDate: z.string().min(1, "Trade date is required"),
  strategy: z.enum(["Income", "Growth", "Diversified"]),
  instrument: z.string().trim().min(1, "Instrument is required").max(120),
  direction: z.enum(["Long", "Short"]),
  entry: z.string().trim().min(1, "Entry is required").max(80),
  exit: z.string().trim().min(1, "Exit is required").max(80),
  outcome: z.string().trim().min(1).max(40).default("Completed"),
  published: z.boolean().default(true),
});

export type PastTradeFormValues = z.infer<typeof pastTradeSchema>;

export const testimonialSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(80),
    content: z.string().trim().min(10, "Content must be at least 10 characters").max(2000),
    mediaType: z.enum(["none", "image", "video"]),
    mediaUrl: z.string().trim().max(500).optional().or(z.literal("")),
    published: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.mediaType !== "none" && !data.mediaUrl?.trim()) {
      ctx.addIssue({ code: "custom", message: "Media URL is required for image or video", path: ["mediaUrl"] });
    }
  });

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;

export const blogPostSchema = z.object({
  title: z.string().trim().min(4, "Title is required").max(160),
  tag: z.string().trim().min(2, "Tag is required").max(40),
  excerpt: z.string().trim().min(10, "Excerpt must be at least 10 characters").max(500),
  content: z.string().trim().max(12000).optional().or(z.literal("")),
  publishedAt: z.string().min(1, "Publish date is required"),
  published: z.boolean().default(true),
  slug: z.string().trim().max(180).optional().or(z.literal("")),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;
