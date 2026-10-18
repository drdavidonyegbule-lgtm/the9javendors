import type { MarketplaceProduct, ProductVariant } from "@/lib/marketplace-data";
import { getVariantStock, isVariantInStock } from "@/lib/use-products";

type ProductVariantPickerProps = {
  product: MarketplaceProduct;
  selectedVariantId: string;
  selectedSize?: string | undefined;
  onSelectVariant: (variantId: string) => void;
  onSelectSize: (size: string) => void;
};

export function ProductVariantPicker({
  product,
  selectedVariantId,
  selectedSize,
  onSelectVariant,
  onSelectSize,
}: ProductVariantPickerProps) {
  const variants = product.variants;
  if (!variants || variants.length < 2) return null;

  const selected = variants.find((v) => v.id === selectedVariantId) ?? variants[0];
  if (!selected) return null;
  const sizes = selected.sizes;

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium">
          Colour / style: <span className="text-foreground">{selected.label}</span>
        </p>
        <div className="flex flex-wrap gap-2.5">
          {variants.map((variant) => {
            const active = variant.id === selectedVariantId;
            const inStock = isVariantInStock(product, variant.id);
            return (
              <button
                key={variant.id}
                type="button"
                title={variant.label}
                aria-label={variant.label}
                aria-pressed={active}
                disabled={!inStock && !active}
                onClick={() => onSelectVariant(variant.id)}
                className={`relative h-10 w-10 rounded-full border-2 transition-shadow ${
                  active
                    ? "border-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                    : "border-border hover:border-primary/50"
                } ${!inStock ? "opacity-40" : ""}`}
                style={
                  variant.swatchImage
                    ? {
                        backgroundImage: `url(${variant.swatchImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : { backgroundColor: variant.swatchColor ?? "#ccc" }
                }
              />
            );
          })}
        </div>
        {!isVariantInStock(product, selected.id) && (
          <p className="mt-2 text-sm text-destructive">Out of stock in this colour</p>
        )}
      </div>

      {sizes && sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const available = s.quantity > 0;
              const active = selectedSize === s.size;
              return (
                <button
                  key={s.size}
                  type="button"
                  disabled={!available}
                  onClick={() => onSelectSize(s.size)}
                  aria-pressed={active}
                  className={`min-w-11 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : available
                        ? "border-input bg-background hover:border-primary/60"
                        : "cursor-not-allowed border-border bg-muted text-muted-foreground line-through opacity-60"
                  }`}
                  title={available ? `${s.quantity} left` : "Sold out"}
                >
                  {s.size}
                  {!available && <span className="sr-only"> (sold out)</span>}
                </button>
              );
            })}
          </div>
          {selectedSize && (
            <p className="mt-2 text-xs text-muted-foreground">
              {getVariantStock(product, selected.id, selectedSize) > 0
                ? `${getVariantStock(product, selected.id, selectedSize)} left in ${selected.label}, size ${selectedSize}`
                : `Sold out in ${selected.label}, size ${selectedSize}`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export type { ProductVariant };
