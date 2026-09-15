import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { buttonGhost, buttonPrimary } from "@/components/ui-classes";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";
import { getProductBySlug } from "@/lib/shop.functions";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: { slug: params.slug } });
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product unavailable — 9Ja Vendors" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const description = product.description.slice(0, 155) || `Buy ${product.name} from 9Ja Vendors.`;
    return {
      meta: [
        { title: `${product.name} — 9Ja Vendors` },
        { name: "description", content: description },
        { property: "og:title", content: `${product.name} — 9Ja Vendors` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductPage,
  notFoundComponent: ProductNotFound,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">We could not load this product</h1>
        <p className="mt-3 text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    </SiteLayout>
  ),
});

function ProductNotFound() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-3 text-muted-foreground">
          This item may have been removed or is no longer available.
        </p>
        <Link to="/shop" className={`${buttonPrimary} mt-6`}>
          Back to shop
        </Link>
      </div>
    </SiteLayout>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    setAdded(true);
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <Link to="/shop" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to shop
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full max-h-[520px] w-full object-cover"
              />
            ) : (
              <div className="grid aspect-4/3 w-full place-items-center text-sm text-surface-foreground/60">
                Photo coming soon
              </div>
            )}
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {product.category}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-2xl font-bold">{formatNaira(product.price)}</p>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {product.description || "Contact us for more details about this product."}
            </p>

            {product.isAvailable ? (
              <div className="mt-8 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold">Quantity</span>
                  <div className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      className="px-2 text-lg leading-none"
                      aria-label="Reduce quantity"
                    >
                      &minus;
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((value) => Math.min(50, value + 1))}
                      className="px-2 text-lg leading-none"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={handleAdd} className={buttonPrimary}>
                    Add to cart
                  </button>
                  {added ? (
                    <Link to="/cart" className={buttonGhost}>
                      Go to cart
                    </Link>
                  ) : null}
                </div>
                {added ? (
                  <p className="mt-3 text-sm text-primary">Added to your cart.</p>
                ) : null}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-border bg-panel p-5 text-sm text-muted-foreground">
                This item is currently unavailable. Contact us and we will let you know when it is
                back.
              </p>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
