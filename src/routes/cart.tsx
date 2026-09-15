import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { buttonGhost, buttonPrimary, buttonSmall } from "@/components/ui-classes";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";
import { getStoreSettings } from "@/lib/shop.functions";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — 9Ja Vendors" },
      {
        name: "description",
        content: "Review the items in your 9Ja Vendors cart before checkout and payment.",
      },
      { property: "og:title", content: "Your cart — 9Ja Vendors" },
      {
        property: "og:description",
        content: "Review the items in your 9Ja Vendors cart before checkout.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQuantity, removeItem, ready } = useCart();
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getStoreSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const deliveryFee = settings?.deliveryFee ?? 0;

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-5xl px-5 py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Your cart</h1>

        {!ready ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading your cart…</p>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-8">
            <p className="text-sm text-muted-foreground">Your cart is empty right now.</p>
            <Link to="/shop" className={`${buttonPrimary} mt-6`}>
              Browse products
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-surface">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-40 flex-1">
                    <Link
                      to="/product/$slug"
                      params={{ slug: item.slug }}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatNaira(item.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-3 rounded-full border border-border px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="px-2 text-lg leading-none"
                      aria-label={`Reduce quantity of ${item.name}`}
                    >
                      &minus;
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="px-2 text-lg leading-none"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatNaira(item.price * item.quantity)}</p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className={`${buttonSmall} mt-2`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-panel p-6">
              <h2 className="text-lg font-bold">Order summary</h2>
              <dl className="mt-5 flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-semibold">{formatNaira(subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="font-semibold">{formatNaira(deliveryFee)}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-base">
                  <dt className="font-semibold">Total payable</dt>
                  <dd className="font-bold">{formatNaira(subtotal + deliveryFee)}</dd>
                </div>
              </dl>
              <Link to="/checkout" className={`${buttonPrimary} mt-6 w-full`}>
                Proceed to checkout
              </Link>
              <Link to="/shop" className={`${buttonGhost} mt-3 w-full`}>
                Keep shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
