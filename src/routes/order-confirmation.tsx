import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

type LastOrder = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
  totalAmount: number;
  totalItems: number;
  items: Array<{ id: string; title: string; quantity: number; price: number }>;
};

export const Route = createFileRoute("/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Payment — 9JA Vendors" },
      { name: "description", content: "Complete payment for your 9JA Vendors order." },
    ],
  }),
  component: OrderConfirmationPage,
});

function OrderConfirmationPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("9ja-vendors-last-order");
      if (raw) setOrder(JSON.parse(raw) as LastOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  if (!order) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
          <h1 className="text-3xl font-bold">No order to pay for</h1>
          <p className="mt-3 text-muted-foreground">Add products to your cart and complete checkout first.</p>
          <Button className="mt-8" asChild>
            <Link to="/categories">Browse products</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 text-3xl font-bold">Almost done — payment</h1>
          <p className="mt-3 text-muted-foreground">
            Your delivery details are saved. Pay below to confirm the order. A dispatch rider will use the address you
            provided.
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Delivery to</h2>
          <p className="mt-3 font-medium">{order.name}</p>
          <p className="text-sm text-muted-foreground">{order.email} · {order.phone}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.address}, {order.city}, {order.state}
          </p>
          {order.notes && <p className="mt-2 text-sm text-muted-foreground">Note: {order.notes}</p>}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Order</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-medium">₦{(item.price * item.quantity).toLocaleString("en-NG")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-base font-bold">
            <span>Amount due</span>
            <span className="text-primary">₦{order.totalAmount.toLocaleString("en-NG")}</span>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
          <CreditCard className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 text-xl font-bold">Payment section</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Online payment (card / transfer / USSD) will be connected here. For now this is the payment step in the
            shopping flow — same place you would pay on Temu after entering your address.
          </p>
          <Button className="mt-6" size="lg" type="button">
            Pay ₦{order.totalAmount.toLocaleString("en-NG")} (coming soon)
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Live payment gateway can be plugged in next (Paystack, Flutterwave, etc.).
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="outline" asChild>
            <Link to="/categories">Continue shopping</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
