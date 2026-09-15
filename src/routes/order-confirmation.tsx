import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { SiteLayout } from "@/components/SiteLayout";
import { buttonGhost, buttonPrimary } from "@/components/ui-classes";
import { useCart } from "@/lib/cart";
import { formatNaira } from "@/lib/money";
import { confirmPayment } from "@/lib/checkout.functions";

type ConfirmationSearch = { reference?: string; trxref?: string };

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: (search: Record<string, unknown>): ConfirmationSearch => ({
    reference: typeof search["reference"] === "string" ? search["reference"] : undefined,
    trxref: typeof search["trxref"] === "string" ? search["trxref"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order confirmation — 9Ja Vendors" },
      {
        name: "description",
        content: "Your 9Ja Vendors order reference and payment confirmation.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Order confirmation — 9Ja Vendors" },
      { property: "og:description", content: "Your 9Ja Vendors order reference." },
    ],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const search = Route.useSearch();
  const reference = search.reference ?? search.trxref ?? "";
  const verify = useServerFn(confirmPayment);
  const { clear } = useCart();

  const { data, isPending, isError } = useQuery({
    queryKey: ["order-confirmation", reference],
    queryFn: () => verify({ data: { reference } }),
    enabled: reference.length > 0,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (data?.ok) clear();
  }, [data, clear]);

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        {!reference ? (
          <Panel
            title="No payment reference found"
            body="We could not find a payment to confirm. If you have just paid, please contact us with your payment reference."
          />
        ) : isPending ? (
          <Panel title="Confirming your payment…" body="Please wait, this only takes a moment." />
        ) : isError || !data ? (
          <Panel
            title="We could not confirm this payment"
            body="Please refresh the page, or contact us with your payment reference and we will sort it out."
          />
        ) : !data.ok ? (
          <Panel title="Payment not completed" body={data.message} />
        ) : (
          <div className="rounded-3xl border border-border bg-card p-8 shadow-glow">
            <span className="inline-flex rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Payment received
            </span>
            <h1 className="mt-5 text-3xl font-extrabold">Thank you, {data.customerName}!</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Your order is confirmed. Our team is already working on it and will contact you on
              the phone number you provided.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-panel p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Order number
                </p>
                <p className="mt-2 text-lg font-bold">{data.orderNumber}</p>
              </div>
              <div className="rounded-2xl border border-border bg-panel p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Payment reference
                </p>
                <p className="mt-2 break-all text-sm font-semibold">{data.reference}</p>
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-border bg-panel p-5">
              <div className="flex flex-col gap-3 text-sm">
                {data.items.map((item, index) => (
                  <div key={`${item.productName}-${index}`} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">
                      {item.productName} &times; {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {formatNaira(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold">{formatNaira(data.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total paid</span>
                  <span className="font-bold">{formatNaira(data.total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className={buttonPrimary}>
                Continue shopping
              </Link>
              <Link to="/contact" className={buttonGhost}>
                Contact support
              </Link>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function Panel({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/shop" className={buttonPrimary}>
          Back to shop
        </Link>
        <Link to="/contact" className={buttonGhost}>
          Contact us
        </Link>
      </div>
    </div>
  );
}
