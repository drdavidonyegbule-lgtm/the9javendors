CREATE SEQUENCE public.vendor_code_seq START 1001;

CREATE TABLE public.vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_code text NOT NULL UNIQUE DEFAULT ('9JV-V' || lpad(nextval('public.vendor_code_seq')::text, 5, '0')),
  owner_name text NOT NULL CHECK (char_length(owner_name) BETWEEN 2 AND 120),
  business_name text NOT NULL CHECK (char_length(business_name) BETWEEN 2 AND 140),
  category text NOT NULL CHECK (category IN ('Fashion', 'Food', 'Beauty', 'Digital Services', 'Crafts')),
  phone text NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  storefront_url text,
  is_verified boolean NOT NULL DEFAULT false,
  is_listed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
GRANT USAGE ON SEQUENCE public.vendor_code_seq TO authenticated, service_role;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage vendors" ON public.vendors
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER vendors_set_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX vendors_directory_idx ON public.vendors (is_listed, is_verified, category);

CREATE TABLE public.event_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE RESTRICT,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  commission_rate numeric(6,5) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1),
  commission_amount numeric(12,2) GENERATED ALWAYS AS (round(amount * commission_rate, 2)) STORED,
  payment_reference text NOT NULL UNIQUE CHECK (char_length(payment_reference) BETWEEN 3 AND 120),
  payment_status text NOT NULL DEFAULT 'paid' CHECK (payment_status IN ('paid', 'refunded', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_sales TO authenticated;
GRANT ALL ON public.event_sales TO service_role;
ALTER TABLE public.event_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage event sales" ON public.event_sales
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER event_sales_set_updated_at BEFORE UPDATE ON public.event_sales
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX event_sales_vendor_created_idx ON public.event_sales (vendor_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.list_public_vendors(_category text DEFAULT NULL)
RETURNS TABLE (
  vendor_code text,
  business_name text,
  category text,
  storefront_url text,
  transaction_volume numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    v.vendor_code,
    v.business_name,
    v.category,
    v.storefront_url,
    COALESCE(SUM(es.amount) FILTER (WHERE es.payment_status = 'paid'), 0)::numeric AS transaction_volume
  FROM public.vendors v
  LEFT JOIN public.event_sales es ON es.vendor_id = v.id
  WHERE v.is_verified = true
    AND v.is_listed = true
    AND (_category IS NULL OR v.category = _category)
  GROUP BY v.id, v.vendor_code, v.business_name, v.category, v.storefront_url
  ORDER BY v.business_name;
$$;
REVOKE ALL ON FUNCTION public.list_public_vendors(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_public_vendors(text) TO anon, authenticated, service_role;

ALTER TABLE public.settings
  ADD COLUMN event_commission_rate numeric(6,5) NOT NULL DEFAULT 0.05000
  CHECK (event_commission_rate >= 0 AND event_commission_rate <= 1);
GRANT SELECT (event_commission_rate) ON public.settings TO anon;
