import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api, getToken } from "@/lib/api-client";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (!getToken()) throw redirect({ to: "/auth/login" });
    const admin = await api.admin.isAdmin();
    if (!admin.isAdmin) throw redirect({ to: "/dashboard" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  return <Outlet />;
}
