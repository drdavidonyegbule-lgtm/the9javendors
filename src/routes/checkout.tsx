import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [{ property: "og:title", content: 'Checkout — 9JA Vendors' }, { property: "og:description", content: 'Enter delivery details and complete your order on 9JA Vendors.' }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },{ name: "robots", content: "noindex" },
      { title: "Checkout — 9JA Vendors" },
      { name: "description", content: "Enter delivery details and complete your order on 9JA Vendors." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { lines, totalItems, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !city.trim() || !state.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    // Store order summary for confirmation screen (simple client-side demo flow)
    const order = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      notes: notes.trim(),
      totalAmount,
      totalItems,
      items: lines.map((l) => ({
        id: l.product.id,
        title: l.product.title,
        quantity: l.quantity,
        price: l.product.price,
      })),
      createdAt: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem("9ja-vendors-last-order", JSON.stringify(order));
    } catch {
      /* ignore */
    }
    clearCart();
    setSubmitted(true);
    void navigate({ to: "/order-confirmation" });
  }

  if (lines.length === 0 && !submitted) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="mt-3 text-muted-foreground">Add products before checkout.</p>
          <Button className="mt-8" asChild>
            <Link to="/categories">Browse products</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Checkout</p>
        <h1 className="mt-3 text-4xl font-bold">Delivery details</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your details so we can send a dispatch rider to your address.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-border bg-card p-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full name <span className="text-destructive">*</span>
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g. Ada Okafor"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="you@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                  Phone <span className="text-destructive">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="0803 000 0000"
                />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                Home address <span className="text-destructive">*</span>
              </label>
              <textarea
                id="address"
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Street, building, landmark"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="mb-2 block text-sm font-medium">
                  City / LGA <span className="text-destructive">*</span>
                </label>
                <input
                  id="city"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. Ikeja"
                />
              </div>
              <div>
                <label htmlFor="state" className="mb-2 block text-sm font-medium">
                  State <span className="text-destructive">*</span>
                </label>
                <input
                  id="state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. Lagos"
                />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-medium">
                Delivery notes (optional)
              </label>
              <input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Gate code, preferred time, etc."
              />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Continue to payment
            </Button>
            <p className="text-xs text-muted-foreground">
              Next step: review payment. Delivery is arranged to the address you provide.
            </p>
          </form>

          <aside className="h-fit rounded-lg border border-border bg-card p-6 shadow-card lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Order summary</h2>
            <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto text-sm">
              {lines.map(({ product, quantity, lineTotal }) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <span className="line-clamp-2 text-muted-foreground">
                    {product.title} × {quantity}
                  </span>
                  <span className="shrink-0 font-medium">₦{lineTotal.toLocaleString("en-NG")}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
              <span>Total ({totalItems} items)</span>
              <span className="text-primary">₦{totalAmount.toLocaleString("en-NG")}</span>
            </div>
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link to="/cart">Back to cart</Link>
            </Button>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
