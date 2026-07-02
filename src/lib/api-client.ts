/** Re-exports for backward compatibility — prefer `@/lib/api`. */
export {
  api,
  API_URL,
  ApiError,
  checkApiHealth,
  clearToken,
  getToken,
  isMockMode,
  loadRazorpayScript,
  openRazorpaySubscriptionCheckout,
  setToken,
} from "./api";

export type {
  ApiUser,
  PlanCatalogRow,
  SubscriptionRecord,
  AdminOverview,
  AdminSubscriber,
  PastTradeRecord,
  PastTradeInput,
  TestimonialRecord,
  TestimonialInput,
  BlogPostRecord,
  BlogPostInput,
} from "./api/types";
