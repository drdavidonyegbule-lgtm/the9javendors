import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { getStoreSettings } from "@/lib/shop.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact 9Ja Vendors" },
      {
        name: "description",
        content:
          "Call, WhatsApp or email the 9Ja Vendors team about an order, a delivery or a product you need.",
      },
      { property: "og:title", content: "Contact 9Ja Vendors" },
      {
        property: "og:description",
        content: "Call, WhatsApp or email the 9Ja Vendors team about your order.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getStoreSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const rows = [
    { label: "Phone", value: settings?.storePhone },
    { label: "WhatsApp", value: settings?.storeWhatsapp },
    { label: "Email", value: settings?.storeEmail },
    { label: "Address", value: settings?.storeAddress },
    { label: "Store hours", value: settings?.storeHours },
  ].filter((row) => Boolean(row.value));

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-3xl px-5 py-16">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Contact us</h1>
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">
          Our team handles every order personally. Reach out about an order, a delivery, or a
          product you would like us to source for you.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Contact details are being updated. Please check back shortly.
            </p>
          ) : (
            <dl className="flex flex-col gap-5">
              {rows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold">{row.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          When you contact us about an existing order, please have your order number or payment
          reference ready so we can find it quickly.
        </p>
      </div>
    </SiteLayout>
  );
}
