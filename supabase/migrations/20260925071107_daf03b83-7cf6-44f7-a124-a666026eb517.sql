CREATE VIEW public.public_vendor_directory
WITH (security_barrier = true)
AS
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
GROUP BY v.id, v.vendor_code, v.business_name, v.category, v.storefront_url;
GRANT SELECT ON public.public_vendor_directory TO anon, authenticated, service_role;

DROP FUNCTION public.list_public_vendors(text);
