import type { SupabaseClient } from "@supabase/supabase-js";

/** Read every publicly visible product; any failed batch fails the whole sitemap. */
export async function sitemapProductSlugs(client: SupabaseClient): Promise<string[]> {
  const slugs: string[] = [];
  const pageSize = 1000;
  for (let offset = 0; ; ) {
    const { data, error } = await client.from("products").select("slug")
      .eq("is_hidden", false).order("id").range(offset, offset + pageSize - 1);
    if (error) throw new Error("Public sitemap product query failed", { cause: error });
    if (!data) throw new Error("Public sitemap product query returned no data");
    if (data.length === 0) return slugs;
    for (const row of data) if (typeof row.slug === "string") slugs.push(row.slug);
    offset += data.length;
  }
}