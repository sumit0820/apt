
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Default role on signup
CREATE OR REPLACE FUNCTION public.grant_default_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_grant_default_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_default_user_role();

-- Plan catalog
CREATE TABLE public.plan_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL,
  duration_months int NOT NULL CHECK (duration_months IN (3, 6, 12)),
  price_inr int NOT NULL,
  razorpay_plan_id text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_key, duration_months)
);

GRANT SELECT ON public.plan_catalog TO authenticated, anon;
GRANT ALL ON public.plan_catalog TO service_role;
ALTER TABLE public.plan_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active plans" ON public.plan_catalog
  FOR SELECT TO authenticated, anon USING (active = true);

INSERT INTO public.plan_catalog (plan_key, duration_months, price_inr, razorpay_plan_id) VALUES
  ('plan-1', 3, 6000, 'test-1'),
  ('plan-1', 6, 12000, 'test-1'),
  ('plan-1', 12, 24000, 'test-1'),
  ('plan-2', 3, 9000, 'test-2'),
  ('plan-2', 6, 18000, 'test-2'),
  ('plan-2', 12, 36000, 'test-2');

-- Subscriptions
CREATE TYPE public.subscription_state AS ENUM (
  'created', 'authenticated', 'active', 'paused', 'halted', 'cancelled', 'completed', 'expired'
);

CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_catalog_id uuid NOT NULL REFERENCES public.plan_catalog(id),
  razorpay_subscription_id text UNIQUE NOT NULL,
  status public.subscription_state NOT NULL DEFAULT 'created',
  current_start timestamptz,
  current_end timestamptz,
  cancel_at_cycle_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subs" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all subs" ON public.subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admins can also read all profiles and payments
CREATE POLICY "Admins read all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins read all payments" ON public.payments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
