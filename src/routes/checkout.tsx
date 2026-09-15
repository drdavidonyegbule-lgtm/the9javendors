import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { buttonPrimary, inputBase, labelBase } from "@/components/ui-classes";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";
import { startCheckout } from "@/lib/checkout.functions";
import { getStoreSettings } from "@/lib/shop.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — 9Ja Vendors" },
      {
        name: "description",
        content:
          "Enter your delivery details and pay securely for your 9Ja Vendors order. No account needed.",
      },
      { property: "og:title", content: "Checkout — 9Ja Vendors" },
      {
        property: "og:description",
        content: "Enter your delivery details and pay securely for your 9Ja Vendors order.",
      },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, ready } = useCart();
  const beginCheckout = useServerFn(startCheckout);
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getStoreSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    deliveryAddress: "",
    deliveryInstructions: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const deliveryFee = settings?.deliveryFee ?? 0;
  const total = subtotal + deliveryFee;

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await beginCheckout({
        data: {
          ...form,
          origin: window.location.origin,
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        },
      });
      if (result.ok) {
        window.location.href = result.authorizationUrl;
        return;
      }
      setError(result.message);
    } catch {
      setError("Something went wrong starting your payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (ready && items.length === 0) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Add a product before heading to checkout.
          </p>
          <Link to="/shop" className={`${buttonPrimary} mt-6`}>
            Browse products
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-5xl px-5 py-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Checkout</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We only need your delivery details. No account required.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelBase} htmlFor="customerName">
                  Full name
                </label>
                <input
                  id="customerName"
                  className={inputBase}
                  value={form.customerName}
                  onChange={(event) => update("customerName", event.target.value)}
                  required
                  maxLength={120}
                />
              </div>
              <div>
                <label className={labelBase} htmlFor="customerPhone">
                  Phone number
                </label>
                <input
                  id="customerPhone"
                  className={inputBase}
                  value={form.customerPhone}
                  onChange={(event) => update("customerPhone", event.target.value)}
                  required
                  maxLength={30}
                  inputMode="tel"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className={labelBase} htmlFor="customerEmail">
                Email address
              </label>
              <input
                id="customerEmail"
                type="email"
                className={inputBase}
                value={form.customerEmail}
                onChange={(event) => update("customerEmail", event.target.value)}
                required
                maxLength={200}
              />
            </div>

            <div className="mt-5">
              <label className={labelBase} htmlFor="deliveryAddress">
                Delivery address
              </label>
              <textarea
                id="deliveryAddress"
                className={`${inputBase} min-h-24`}
                value={form.deliveryAddress}
                onChange={(event) => update("deliveryAddress", event.target.value)}
                required
                maxLength={500}
              />
            </div>

            <div className="mt-5">
              <label className={labelBase} htmlFor="deliveryInstructions">
                Delivery instructions (optional)
              </label>
              <textarea
                id="deliveryInstructions"
                className={`${inputBase} min-h-20`}
                value={form.deliveryInstructions}
                onChange={(event) => update("deliveryInstructions", event.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-panel p-6">
            <h2 className="text-lg font-bold">Your order</h2>
            <div className="mt-4 flex flex-col gap-3 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between gap-3">
                  <span className="text-muted-foreground">
                    {item.name} &times; {item.quantity}
                  </span>
                  <span className="font-semibold">{formatNaira(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <dl className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-semibold">{formatNaira(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-semibold">{formatNaira(deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt className="font-semibold">Total payable</dt>
                <dd className="font-bold">{formatNaira(total)}</dd>
              </div>
            </dl>

            {error ? (
              <p className="mt-5 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm text-foreground">
                {error}
              </p>
            ) : null}

            <button type="submit" disabled={submitting} className={`${buttonPrimary} mt-6 w-full`}>
              {submitting ? "Starting payment…" : "Pay now"}
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
              You will be taken to Paystack to complete payment securely.
            </p>
          </aside>
        </form>
      </div>
    </SiteLayout>
  );
}
