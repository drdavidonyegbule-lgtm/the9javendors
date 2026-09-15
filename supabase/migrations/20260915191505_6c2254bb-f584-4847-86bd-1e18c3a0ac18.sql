INSERT INTO public.products (name, slug, description, price, category, image_path, is_available, is_hidden)
VALUES (
  'Golden Harvest Long Grain Parboiled Rice 50kg',
  'golden-harvest-parboiled-rice-50kg',
  'Premium long grain parboiled Nigerian rice in a sealed 50kg bag. Clean, stone-free grains that cook soft and separate — ideal for jollof, fried rice and everyday family meals. Delivered to your door in Lagos.',
  78000,
  'Foodstuff',
  'products/golden-harvest-rice-50kg.jpg',
  true,
  false
)
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_path = EXCLUDED.image_path,
  is_available = true,
  is_hidden = false;

INSERT INTO public.product_supplier_info (product_id, supplier_name, supplier_phone, supplier_cost)
SELECT id, 'Mile 12 Grains Depot', '+2348030000000', 71500
FROM public.products WHERE slug = 'golden-harvest-parboiled-rice-50kg'
ON CONFLICT (product_id) DO UPDATE SET
  supplier_name = EXCLUDED.supplier_name,
  supplier_phone = EXCLUDED.supplier_phone,
  supplier_cost = EXCLUDED.supplier_cost;