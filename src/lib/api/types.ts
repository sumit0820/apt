export type ApiUser = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  panNumber: string | null;
  planId: string | null;
  subscriptionStatus: string;
  subscriptionStartedAt: string | null;
  subscriptionExpiresAt: string | null;
  roles: string[];
  createdAt?: string;
};

export type PlanCatalogRow = {
  id: string;
  planKey: string;
  durationMonths: number;
  priceInr: number;
  razorpayPlanId: string;
};

export type SubscriptionRecord = {
  id: string;
  razorpay_subscription_id: string;
  status: string;
  current_start: string | null;
  current_end: string | null;
  cancel_at_cycle_end: boolean;
  plan_catalog: {
    plan_key: string;
    duration_months: number;
    price_inr: number;
  } | null;
};

export type AdminSubscriber = {
  id: string;
  status: string;
  current_end: string | null;
  plan_key: string;
  duration_months: number;
  price_inr: number;
  email: string | null;
  full_name: string | null;
};

export type AdminOverview = {
  totalUsers: number;
  activeSubscribers: number;
  mrrInr: number;
  expiringSoon: Array<{
    id: string;
    current_end: string | null;
    cancel_at_cycle_end: boolean;
    email: string | null;
    full_name: string | null;
    plan_key: string;
    duration_months: number;
  }>;
};

export type PastTradeRecord = {
  id: string;
  tradeDate: string;
  strategy: "Income" | "Growth" | "Diversified";
  instrument: string;
  direction: "Long" | "Short";
  entry: string;
  exit: string;
  outcome: string;
  published: boolean;
};

export type PastTradeInput = Omit<PastTradeRecord, "id">;

export type TestimonialMediaType = "none" | "image" | "video";

export type TestimonialRecord = {
  id: string;
  name: string;
  content: string;
  mediaType: TestimonialMediaType;
  mediaUrl: string | null;
  published: boolean;
  createdAt?: string;
};

export type TestimonialInput = Omit<TestimonialRecord, "id" | "createdAt">;

export type BlogPostRecord = {
  id: string;
  title: string;
  tag: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  published: boolean;
  slug: string | null;
  createdAt?: string;
};

export type BlogPostInput = Omit<BlogPostRecord, "id" | "createdAt" | "slug"> & { slug?: string | null };

export type ApiClient = {
  auth: {
    signup(body: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      planId?: string;
      panNumber?: string;
    }): Promise<{ token: string; user: ApiUser }>;
    login(email: string, password: string): Promise<{ token: string; user: ApiUser }>;
    me(): Promise<{ user: ApiUser }>;
    forgotPassword(email: string): Promise<{ ok: boolean; resetToken?: string; message?: string }>;
    resetPassword(token: string, password: string): Promise<{ ok: boolean }>;
    logout(): void;
  };
  profile: {
    update(body: { panNumber?: string; phone?: string; fullName?: string }): Promise<{ user: ApiUser }>;
  };
  plans: {
    list(): Promise<{ plans: PlanCatalogRow[] }>;
  };
  health: {
    check(): Promise<{ ok: boolean; service: string; timestamp?: string }>;
  };
  razorpay: {
    config(): Promise<{ keyId: string; configured: boolean }>;
  };
  subscriptions: {
    create(planKey: string, durationMonths: number): Promise<{
      subscriptionId: string;
      keyId: string;
      priceInr: number;
      planKey: string;
      durationMonths: number;
    }>;
    verify(subscriptionId: string, paymentId: string, signature: string): Promise<{ ok: boolean }>;
    me(): Promise<{ subscription: SubscriptionRecord | null }>;
    cancel(atCycleEnd?: boolean): Promise<{ ok: boolean }>;
    change(planKey: string, durationMonths: number, immediate?: boolean): Promise<{ ok: boolean; scheduled: string }>;
  };
  admin: {
    isAdmin(): Promise<{ isAdmin: boolean }>;
    overview(): Promise<AdminOverview>;
    subscribers(): Promise<{ subscribers: AdminSubscriber[] }>;
    addUser(body: { email: string; password: string; fullName: string }): Promise<{ ok: boolean; userId: string }>;
    trades: {
      list(): Promise<{ trades: PastTradeRecord[] }>;
      create(body: PastTradeInput): Promise<{ trade: PastTradeRecord }>;
      update(id: string, body: Partial<PastTradeInput>): Promise<{ trade: PastTradeRecord }>;
      remove(id: string): Promise<{ ok: boolean }>;
    };
    testimonials: {
      list(): Promise<{ testimonials: TestimonialRecord[] }>;
      create(body: TestimonialInput): Promise<{ testimonial: TestimonialRecord }>;
      update(id: string, body: Partial<TestimonialInput>): Promise<{ testimonial: TestimonialRecord }>;
      remove(id: string): Promise<{ ok: boolean }>;
    };
    blogs: {
      list(): Promise<{ posts: BlogPostRecord[] }>;
      create(body: BlogPostInput): Promise<{ post: BlogPostRecord }>;
      update(id: string, body: Partial<BlogPostInput>): Promise<{ post: BlogPostRecord }>;
      remove(id: string): Promise<{ ok: boolean }>;
    };
  };
  contact: {
    submit(body: { name: string; email: string; message: string }): Promise<{ ok: boolean; message: string }>;
  };
  trades: {
    list(): Promise<{ trades: PastTradeRecord[] }>;
  };
  testimonials: {
    list(): Promise<{ testimonials: TestimonialRecord[] }>;
  };
  blogs: {
    list(): Promise<{ posts: BlogPostRecord[] }>;
    get(slug: string): Promise<{ post: BlogPostRecord }>;
  };
};
