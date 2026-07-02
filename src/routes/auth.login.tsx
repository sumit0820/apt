import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { api, setToken } from "@/lib/api-client";
import { loginSchema, type LoginFormValues } from "@/lib/form-schemas";
import { FormIconField } from "@/components/forms/form-fields";
import { Form } from "@/components/ui/form";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Login — Apex Pro Traders" },
      { name: "description", content: "Sign in to your Apex Pro Traders account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      const { token } = await api.auth.login(values.email.trim(), values.password);
      setToken(token);
      toast.success("Welcome back!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    }
  }

  async function handleReset() {
    const email = form.getValues("email").trim();
    if (!email) {
      form.setError("email", { message: "Enter your email first" });
      return;
    }
    try {
      const res = await api.auth.forgotPassword(email);
      if (res.resetToken) {
        toast.success("Dev reset token generated");
        navigate({ to: "/auth/reset-password", search: { token: res.resetToken } });
        return;
      }
      toast.success(res.message ?? "If that email exists, a reset link was sent.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send reset link");
    }
  }

  const loading = form.formState.isSubmitting;

  return (
    <AuthShell>
      <h1 className="text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to access your research dashboard.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormIconField control={form.control} name="email" icon={Mail} type="email" placeholder="Email address" />
          <FormIconField control={form.control} name="password" icon={Lock} type="password" placeholder="Password" />
          <button
            type="button"
            onClick={handleReset}
            className="block text-xs text-primary hover:underline"
          >
            Forgot password?
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
          </button>
        </form>
      </Form>

      <p className="mt-6 text-sm text-center text-muted-foreground">
        New here? <Link to="/auth/signup" className="text-primary font-semibold hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl">{children}</div>
      </div>
    </div>
  );
}
