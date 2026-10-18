import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, MapPin, Minus, Package, Plus, ShoppingCart, Store, Check } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductVariantPicker } from "@/components/product-variant-picker";
import { Button } from "@/components/ui/button";
import {
  getEffectivePrice,
  getProductById,
  getVariantStock,
  isVariantInStock,
  useProducts,
} from "@/lib/use-products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    // Base product only (no synthetic cart ids on this route)
    const product = getProductById(params.id.split("::")[0]!);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — 9JA Vendors` : "Product not found — 9JA Vendors" },
      { name: "description", content: loaderData?.description ?? "Discover authentic Nigerian products on 9JA Vendors." },
      { property: "og:title", content: loaderData ? `${loaderData.title} — 9JA Vendors` : "Product not found — 9JA Vendors" },
      { property: "og:description", content: loaderData?.description ?? "Discover authentic Nigerian products on 9JA Vendors." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-24">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <Button className="mt-6" asChild>
          <Link to="/categories">Browse products</Link>
        </Button>
      </div>
    </PageShell>
  ),
});

function ProductPage() {
  const product = Route.useLoaderData();
  const { addItem } = useCart();
  const hasVariants = Boolean(product.variants && product.variants.length > 1);

  const [variantId, setVariantId] = useState<string | undefined>(
    hasVariants ? product.variants![0]!.id : undefined,
  );
  const [size, setSize] = useState<string | undefined>(() => {
    if (!hasVariants) return undefined;
    const first = product.variants![0]!;
    return first.sizes?.find((s) => s.quantity > 0)?.size ?? first.sizes?.[0]?.size;
  });
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = useMemo(
    () => (variantId ? product.variants?.find((v) => v.id === variantId) : undefined),
    [product, variantId],
  );

  const galleryImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : [product.image];

  const maxQty = hasVariants
    ? getVariantStock(product, variantId, size)
    : product.quantity;
  const inStock = hasVariants
    ? isVariantInStock(product, variantId) && maxQty > 0
    : product.quantity > 0;
  const unitPrice = getEffectivePrice(product, variantId);

  // When variant changes, pick first available size
  useEffect(() => {
    if (!selectedVariant?.sizes?.length) {
      setSize(undefined);
      return;
    }
    const preferred =
      selectedVariant.sizes.find((s) => s.size === size && s.quantity > 0) ??
      selectedVariant.sizes.find((s) => s.quantity > 0) ??
      selectedVariant.sizes[0];
    setSize(preferred?.size);
    setQty(1);
    setAdded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId]);

  useEffect(() => {
    setQty((q) => Math.min(Math.max(1, q), Math.max(1, maxQty || 1)));
  }, [maxQty]);

  const related = useProducts()
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function changeQty(delta: number) {
    setQty((q) => Math.max(1, Math.min(maxQty, q + delta)));
    setAdded(false);
  }

  function handleAdd() {
    if (!inStock || maxQty <= 0) return;
    // Products without variants: unchanged addItem(product.id, qty)
    // With variants: synthetic id productId::variantId or productId::variantId::size
    let cartId = product.id;
    if (hasVariants && variantId) {
      cartId = size ? `${product.id}::${variantId}::${size}` : `${product.id}::${variantId}`;
    }
    addItem(cartId, qty);
    setAdded(true);
  }

  function onSelectVariant(id: string) {
    setVariantId(id);
    setAdded(false);
  }

  function onSelectSize(s: string) {
    setSize(s);
    setQty(1);
    setAdded(false);
  }

  const stockMessage = (() => {
    if (!hasVariants) {
      return inStock ? (
        <span>
          <strong className="text-foreground">{product.quantity}</strong> in stock
        </span>
      ) : (
        "Out of stock"
      );
    }
    if (!inStock) return selectedVariant ? `Out of stock in ${selectedVariant.label}` : "Out of stock";
    if (size && selectedVariant) {
      return (
        <span>
          <strong className="text-foreground">{maxQty}</strong> left in {selectedVariant.label}, size {size}
        </span>
      );
    }
    return (
      <span>
        <strong className="text-foreground">{maxQty}</strong> available
        {selectedVariant ? ` in ${selectedVariant.label}` : ""}
      </span>
    );
  })();

  const needsSize = Boolean(selectedVariant?.sizes?.length);
  const canAdd = inStock && maxQty > 0 && (!needsSize || Boolean(size));

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="size-4" /> All products
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <ProductGallery images={galleryImages} alt={product.title} />

          <div className="flex flex-col justify-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">{product.category}</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{product.title}</h1>
            <p className="mt-5 text-3xl font-bold text-primary">
              ₦{unitPrice.toLocaleString("en-NG")}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Package className="size-4" />
                {stockMessage}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {product.location}
              </span>
            </div>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">{product.description}</p>

            <div className="mt-8 rounded-lg border border-border bg-card p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Store className="size-4 text-primary" />
                Sold by authentic Nigerian vendor
              </p>
              <p className="mt-2 text-lg font-bold">{product.vendorName}</p>
              <p className="mt-1 text-sm text-muted-foreground">{product.location}</p>
            </div>

            {hasVariants && variantId && (
              <div className="mt-8">
                <ProductVariantPicker
                  product={product}
                  selectedVariantId={variantId}
                  selectedSize={size}
                  onSelectVariant={onSelectVariant}
                  onSelectSize={onSelectSize}
                />
              </div>
            )}

            {canAdd && (
              <div className="mt-8 space-y-4">
                <div>
                  <p className="mb-2 text-sm font-medium">Quantity</p>
                  <div className="inline-flex items-center rounded-md border border-input bg-background">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Decrease quantity"
                      disabled={qty <= 1}
                      onClick={() => changeQty(-1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-12 text-center text-base font-semibold tabular-nums">{qty}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Increase quantity"
                      disabled={qty >= maxQty}
                      onClick={() => changeQty(1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" onClick={handleAdd} className="min-w-[160px]">
                    {added ? (
                      <>
                        <Check className="size-4" /> Added to cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="size-4" /> Add to cart
                      </>
                    )}
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/cart">View cart</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Subtotal:{" "}
                  <strong className="text-foreground">
                    ₦{(unitPrice * qty).toLocaleString("en-NG")}
                  </strong>
                </p>
              </div>
            )}

            {!canAdd && (
              <p className="mt-8 font-medium text-destructive">
                {needsSize && !size
                  ? "Select a size to continue."
                  : "This product is currently out of stock."}
              </p>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-border py-12">
            <h2 className="text-2xl font-bold">More in {product.category}</h2>
            <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
