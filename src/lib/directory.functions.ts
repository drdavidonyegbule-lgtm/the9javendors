import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const VENDOR_CATEGORIES = ["Fashion", "Food", "Beauty", "Digital Services", "Crafts"] as const;

export type DirectoryVendor = {
  vendorCode: string;
  businessName: string;
  category: string;
  storefrontUrl: string | null;
  transactionVolume: number;
};

const searchSchema = z.object({ category: z.enum(VENDOR_CATEGORIES).optional() });

export const listDirectoryVendors = createServerFn({ method: "GET" })
  .inputValidator((data: { category?: string }) => searchSchema.parse(data))
  .handler(async ({ data }): Promise<DirectoryVendor[]> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const client = createPublicClient();
    let query = client
      .from("public_vendor_directory")
      .select("vendor_code, business_name, category, storefront_url, transaction_volume")
      .order("business_name");
    if (data.category) query = query.eq("category", data.category);
    const { data: rows, error } = await query;
    if (error) throw new Error("The vendor directory is temporarily unavailable.");
    return (rows ?? []).map((row) => ({
      vendorCode: row.vendor_code,
      businessName: row.business_name,
      category: row.category,
      storefrontUrl: row.storefront_url,
      transactionVolume: Number(row.transaction_volume ?? 0),
    }));
  });
