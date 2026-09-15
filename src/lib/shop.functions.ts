import { createServerFn } from "@tanstack/react-start";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  isAvailable: boolean;
};

export type StoreSettings = {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeWhatsapp: string;
  storeAddress: string;
  deliveryFee: number;
  currencyCode: string;
  currencySymbol: string;
  storeHours: string;
};

const PRODUCT_COLUMNS =
  "id, name, slug, description, price, category, image_url, image_path, is_available";

type ProductRow = {
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

export const listProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicProduct[]> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const { mapProducts } = await import("./products.server");
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_hidden", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("listProducts failed", error.message);
      return [];
    }
    return mapProducts(supabase, (data ?? []) as ProductRow[]);
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 200) }))
  .handler(async ({ data }): Promise<PublicProduct | null> => {
    const { createPublicClient } = await import("./supabase-public.server");
    const { mapProducts } = await import("./products.server");
    const supabase = createPublicClient();

    const { data: row, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .eq("is_hidden", false)
      .maybeSingle();

    if (error || !row) return null;
    const [product] = await mapProducts(supabase, [row as ProductRow]);
    return product ?? null;
  });

export const getStoreSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<StoreSettings> => {
    const { createPublicClient, PUBLIC_SETTINGS_COLUMNS } = await import(
      "./supabase-public.server"
    );
    const supabase = createPublicClient();

    const { data } = await supabase
      .from("settings")
      .select(PUBLIC_SETTINGS_COLUMNS)
      .maybeSingle();

    return {
      storeName: data?.["store_name"] ?? "9Ja Vendors",
      storePhone: data?.["store_phone"] ?? "",
      storeEmail: data?.["store_email"] ?? "",
      storeWhatsapp: data?.["store_whatsapp"] ?? "",
      storeAddress: data?.["store_address"] ?? "",
      deliveryFee: Number(data?.["delivery_fee"] ?? 0),
    };
  },
);
