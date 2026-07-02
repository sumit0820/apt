import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Lock, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/form-schemas";
import { FormIconField } from "@/components/forms/form-fields";
import { Form } from "@/components/ui/form";
import { AuthShell } from "./auth.login";

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Reset password — Apex Pro Traders" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast.error("Missing reset token");
      return;
    }
    try {
      await api.auth.resetPassword(token, values.password);
      toast.success("Password updated. Please sign in.");
      navigate({ to: "/auth/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reset password");
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 text-sm text-muted-foreground">Choose a strong password you don't use anywhere else.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormIconField control={form.control} name="password" icon={Lock} type="password" placeholder="New password" />
          <FormIconField control={form.control} name="confirm" icon={Lock} type="password" placeholder="Confirm new password" />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update password
          </button>
        </form>
      </Form>
    </AuthShell>
  );
}
