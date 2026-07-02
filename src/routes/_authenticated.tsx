import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api, clearToken, getToken } from "@/lib/api-client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    if (!getToken()) throw redirect({ to: "/auth/login" });
    try {
      const { user } = await api.auth.me();
      return { user };
    } catch {
      clearToken();
      throw redirect({ to: "/auth/login" });
    }
  },
  component: () => <Outlet />,
});
