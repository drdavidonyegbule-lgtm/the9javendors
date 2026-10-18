import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [{ property: "og:title", content: 'Your cart — 9JA Vendors' }, { property: "og:description", content: 'Review items in your cart before checkout on 9JA Vendors.' }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },{ name: "robots", content: "noindex" },
      { title: "Your cart — 9JA Vendors" },
      { name: "description", content: "Review items in your cart before checkout on 9JA Vendors." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { lines, totalItems, totalAmount, setQuantity, removeItem } = useCart();

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Shopping cart</p>
        <h1 className="mt-3 text-4xl font-bold">Your cart</h1>
        <p className="mt-2 text-muted-foreground">
          {totalItems === 0
            ? "Your cart is empty."
            : `${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart`}
        </p>

        {lines.length === 0 ? (
          <div className="mt-16 py-12 text-center">
            <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-semibold">No products yet</p>
            <p className="mt-2 text-muted-foreground">Browse authentic Nigerian products and add them to your cart.</p>
            <Button className="mt-6" asChild>
              <Link to="/categories">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              {lines.map(({ product, quantity, lineTotal }) => (
                <article
                  key={product.id}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center"
                >
                  <Link to="/products/$id" params={{ id: product.id }} className="shrink-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-28 w-full rounded-md object-cover sm:h-24 sm:w-24"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase text-primary">{product.category}</p>
                    <Link
                      to="/products/$id"
                      params={{ id: product.id }}
                      className="mt-1 block font-semibold hover:text-primary"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{product.vendorName}</p>
                    <p className="mt-2 font-bold text-primary">₦{product.price.toLocaleString("en-NG")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 sm:flex-col sm:items-end">
                    <div className="inline-flex items-center rounded-md border border-input">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Decrease"
                        disabled={quantity <= 1}
                        onClick={() => setQuantity(product.id, quantity - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Increase"
                        disabled={quantity >= product.quantity}
                        onClick={() => setQuantity(product.id, quantity + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <p className="text-sm font-bold">₦{lineTotal.toLocaleString("en-NG")}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => removeItem(product.id)}
                    >
                      <Trash2 className="size-4" /> Remove
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
              <h2 className="text-lg font-bold">Order summary</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({totalItems})</span>
                  <span>₦{totalAmount.toLocaleString("en-NG")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
                <span>Total</span>
                <span className="text-primary">₦{totalAmount.toLocaleString("en-NG")}</span>
              </div>
              <Button className="mt-6 w-full" size="lg" asChild>
                <Link to="/checkout">Proceed to checkout</Link>
              </Button>
              <Button className="mt-3 w-full" variant="outline" asChild>
                <Link to="/categories">Continue shopping</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </PageShell>
  );
}
