import { products } from "./marketplace-data";

/** @deprecated Product-first marketplace — use useProducts instead. */
export type MarketplaceVendor = {
  slug: string;
  name: string;
  category: string;
  location: string;
  rating: number | null;
  reviews: number;
  image: string;
  description: string;
  phone: string;
  whatsapp: string;
  products: string[];
  verified?: boolean;
  example?: boolean;
};

/** Kept for any legacy imports; returns empty list. */
export function useVendors(): MarketplaceVendor[] {
  return [];
}

export { products };
