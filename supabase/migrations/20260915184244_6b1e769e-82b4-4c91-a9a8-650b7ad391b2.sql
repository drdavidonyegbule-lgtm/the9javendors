CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','staff'))
$$;

CREATE POLICY "Users can read their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  price numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  category text NOT NULL DEFAULT 'General',
  image_url text,
  is_available boolean NOT NULL DEFAULT true,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible products" ON public.products
  FOR SELECT USING (is_hidden = false);
CREATE POLICY "Staff can manage products" ON public.products
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_supplier_info (
  product_id uuid PRIMARY KEY REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_name text,
  supplier_phone text,
  supplier_cost numeric(12,2),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_supplier_info TO authenticated;
GRANT ALL ON public.product_supplier_info TO service_role;
ALTER TABLE public.product_supplier_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage supplier info" ON public.product_supplier_info
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER supplier_info_set_updated_at BEFORE UPDATE ON public.product_supplier_info
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE SEQUENCE public.order_number_seq START 1001;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('9JV-' || lpad(nextval('public.order_number_seq')::text, 5, '0')),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  delivery_address text NOT NULL,
  delivery_instructions text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  payment_reference text NOT NULL UNIQUE,
  payment_status text NOT NULL DEFAULT 'paid',
  status text NOT NULL DEFAULT 'new',
  confirmed_delivery_cost numeric(12,2),
  staff_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT USAGE ON SEQUENCE public.order_number_seq TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage orders" ON public.orders
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage order items" ON public.order_items
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  store_name text NOT NULL DEFAULT '9Ja Vendors',
  store_phone text NOT NULL DEFAULT '',
  store_email text NOT NULL DEFAULT '',
  store_whatsapp text NOT NULL DEFAULT '',
  store_address text NOT NULL DEFAULT '',
  delivery_fee numeric(12,2) NOT NULL DEFAULT 2000,
  alert_email text NOT NULL DEFAULT 'nupsyak@gmail.com',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, store_name, store_phone, store_email, store_whatsapp, store_address, delivery_fee) ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view store settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Staff can update settings" ON public.settings
  FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER settings_set_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.settings (id, store_phone, store_email, store_whatsapp, store_address, delivery_fee)
VALUES (true, '+234 000 000 0000', 'nupsyak@gmail.com', '+234 000 000 0000', 'Lagos, Nigeria', 2000);

INSERT INTO public.products (name, slug, description, price, category, is_available)
VALUES
 ('Premium Basmati Rice (10kg)', 'premium-basmati-rice-10kg', 'Long grain aromatic basmati rice, carefully sorted and bagged. Perfect for jollof, fried rice and everyday meals.', 28500.00, 'Foodstuff', true),
 ('Golden Palm Oil (25 Litres)', 'golden-palm-oil-25-litres', 'Fresh, unadulterated red palm oil sourced directly from trusted mills in the South East.', 48000.00, 'Foodstuff', true),
 ('Solar Rechargeable Fan', 'solar-rechargeable-fan', '16-inch rechargeable standing fan with solar panel input and 8 hours of battery runtime.', 62500.00, 'Home & Power', true),
 ('Stainless Steel Cookware Set', 'stainless-steel-cookware-set', 'Five-piece heavy-bottom stainless steel pot set with tempered glass lids.', 74000.00, 'Kitchen', true);