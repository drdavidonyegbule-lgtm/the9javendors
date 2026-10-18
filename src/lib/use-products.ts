import { products, type MarketplaceProduct, type ProductVariant } from "./marketplace-data";

export type { MarketplaceProduct, ProductVariant };

/** Product catalogue hook — seeded local data. */
export function useProducts(): MarketplaceProduct[] {
  return products;
}

/**
 * Resolve a product by id. Supports synthetic cart ids:
 *   productId
 *   productId::variantId
 *   productId::variantId::size
 * so the existing cart can store variant selections without API changes.
 */
export function getProductById(id: string): MarketplaceProduct | undefined {
  if (!id.includes("::")) {
    return products.find((p) => p.id === id);
  }
  const [baseId, variantId, size] = id.split("::");
  const base = products.find((p) => p.id === baseId);
  if (!base) return undefined;
  const variant = base.variants?.find((v) => v.id === variantId);
  if (!variant) return base;

  const stock = getVariantStock(base, variantId, size || undefined);
  const price = variant.price ?? base.price;
  const image = variant.images[0] ?? base.image;
  const sizeLabel = size ? `, size ${size}` : "";
  return {
    ...base,
    id, // keep synthetic id for cart line identity
    title: `${base.title} — ${variant.label}${sizeLabel}`,
    price,
    quantity: stock,
    image,
  };
}

export function getVariant(
  product: MarketplaceProduct,
  variantId: string | undefined,
): ProductVariant | undefined {
  if (!variantId || !product.variants?.length) return undefined;
  return product.variants.find((v) => v.id === variantId);
}

/** Available quantity for a variant, optionally for a specific size. */
export function getVariantStock(
  product: MarketplaceProduct,
  variantId: string | undefined,
  size?: string,
): number {
  if (!variantId || !product.variants?.length) {
    return product.quantity;
  }
  const variant = product.variants.find((v) => v.id === variantId);
  if (!variant) return 0;
  if (variant.sizes?.length) {
    if (size) {
      return variant.sizes.find((s) => s.size === size)?.quantity ?? 0;
    }
    return variant.sizes.reduce((sum, s) => sum + s.quantity, 0);
  }
  return variant.quantity ?? 0;
}

/** True if the variant has any stock (any size or its single quantity). */
export function isVariantInStock(
  product: MarketplaceProduct,
  variantId: string | undefined,
): boolean {
  return getVariantStock(product, variantId) > 0;
}

export function getEffectivePrice(
  product: MarketplaceProduct,
  variantId?: string,
): number {
  if (!variantId || !product.variants?.length) return product.price;
  const variant = product.variants.find((v) => v.id === variantId);
  return variant?.price ?? product.price;
}
