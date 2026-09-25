DROP VIEW public.public_vendor_directory;

ALTER TABLE public.vendors
  ADD COLUMN transaction_volume numeric(12,2) NOT NULL DEFAULT 0
  CHECK (transaction_volume >= 0);

CREATE OR REPLACE FUNCTION public.refresh_vendor_transaction_volume()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_vendor_id uuid;
BEGIN
  target_vendor_id := COALESCE(NEW.vendor_id, OLD.vendor_id);
  UPDATE public.vendors
  SET transaction_volume = COALESCE((
    SELECT SUM(amount)
    FROM public.event_sales
    WHERE vendor_id = target_vendor_id AND payment_status = 'paid'
  ), 0)
  WHERE id = target_vendor_id;
  RETURN COALESCE(NEW, OLD);
END;
$$;
REVOKE ALL ON FUNCTION public.refresh_vendor_transaction_volume() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_vendor_transaction_volume() TO service_role;

CREATE TRIGGER event_sales_refresh_vendor_volume
AFTER INSERT OR UPDATE OR DELETE ON public.event_sales
FOR EACH ROW EXECUTE FUNCTION public.refresh_vendor_transaction_volume();

CREATE POLICY "Anyone can view listed verified vendors" ON public.vendors
  FOR SELECT TO anon, authenticated
  USING (is_verified = true AND is_listed = true);
GRANT SELECT (vendor_code, business_name, category, storefront_url, transaction_volume) ON public.vendors TO anon;

CREATE VIEW public.public_vendor_directory
WITH (security_invoker = true, security_barrier = true)
AS
SELECT vendor_code, business_name, category, storefront_url, transaction_volume
FROM public.vendors
WHERE is_verified = true AND is_listed = true;
GRANT SELECT ON public.public_vendor_directory TO anon, authenticated, service_role;
