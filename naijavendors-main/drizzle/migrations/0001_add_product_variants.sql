CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  swatch_color text,
  swatch_image text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_override numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads product_variants" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners create product_variants" ON public.product_variants FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
);
CREATE POLICY "Owners update product_variants" ON public.product_variants FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
);
CREATE POLICY "Owners delete product_variants" ON public.product_variants FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.products p JOIN public.vendors v ON v.id = p.vendor_id WHERE p.id = product_id AND v.user_id = auth.uid())
);

CREATE TABLE public.product_variant_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.product_variant_sizes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variant_sizes TO authenticated;
GRANT ALL ON public.product_variant_sizes TO service_role;
ALTER TABLE public.product_variant_sizes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads product_variant_sizes" ON public.product_variant_sizes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Owners create product_variant_sizes" ON public.product_variant_sizes FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    JOIN public.vendors v ON v.id = p.vendor_id
    WHERE pv.id = variant_id AND v.user_id = auth.uid()
  )
);
CREATE POLICY "Owners update product_variant_sizes" ON public.product_variant_sizes FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    JOIN public.vendors v ON v.id = p.vendor_id
    WHERE pv.id = variant_id AND v.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    JOIN public.vendors v ON v.id = p.vendor_id
    WHERE pv.id = variant_id AND v.user_id = auth.uid()
  )
);
CREATE POLICY "Owners delete product_variant_sizes" ON public.product_variant_sizes FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.product_variants pv
    JOIN public.products p ON p.id = pv.product_id
    JOIN public.vendors v ON v.id = p.vendor_id
    WHERE pv.id = variant_id AND v.user_id = auth.uid()
  )
);

CREATE INDEX product_variants_product_idx ON public.product_variants(product_id);
CREATE INDEX product_variant_sizes_variant_idx ON public.product_variant_sizes(variant_id);
