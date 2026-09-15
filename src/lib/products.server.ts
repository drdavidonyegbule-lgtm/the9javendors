import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublicProduct } from "./shop.functions";

const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24 * 7;

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  category: string;
  image_url: string | null;
  image_path: string | null;
  is_available: boolean;
};

/** Resolves product image paths in the private bucket into signed URLs. */
export async function mapProducts(
  supabase: SupabaseClient,
  rows: Row[],
): Promise<PublicProduct[]> {
  const paths = rows.map((row) => row.image_path).filter((p): p is string => Boolean(p));
  const signed = new Map<string, string>();

  if (paths.length > 0) {
    const { data } = await supabase.storage
      .from("product-images")
      .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
    for (const entry of data ?? []) {
      if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    category: row.category,
    imageUrl: (row.image_path ? signed.get(row.image_path) : null) ?? row.image_url ?? null,
    isAvailable: row.is_available,
  }));
}
