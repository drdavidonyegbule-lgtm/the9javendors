ALTER TABLE public.settings
  ADD COLUMN IF NOT EXISTS currency_code text NOT NULL DEFAULT 'NGN',
  ADD COLUMN IF NOT EXISTS currency_symbol text NOT NULL DEFAULT '₦',
  ADD COLUMN IF NOT EXISTS store_hours text NOT NULL DEFAULT 'Monday to Saturday, 8am - 6pm';