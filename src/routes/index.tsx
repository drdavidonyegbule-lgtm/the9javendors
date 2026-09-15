import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import heroImage from "@/assets/hero-goods.jpg";
import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { buttonGhost, buttonPrimary } from "@/components/ui-classes";
import { listProducts } from "@/lib/shop.functions";

const productsQuery = queryOptions({
  queryKey: ["products", "public"],
  queryFn: () => listProducts(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
  },
  head: () => ({
    meta: [
      { title: "9Ja Vendors — Buy foodstuff, home and kitchen goods online" },
      {
        name: "description",
        content:
          "Order rice, oil, cookware and home essentials from 9Ja Vendors. Pay securely online and our team sources and delivers to your address.",
      },
      {
        property: "og:title",
        content: "9Ja Vendors — Buy foodstuff, home and kitchen goods online",
      },
      {
        property: "og:description",
        content:
          "Order rice, oil, cookware and home essentials from 9Ja Vendors. Pay securely online and we deliver to your address.",
      },
    ],
  }),
  component: HomePage,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">We could not load the shop</h1>
        <p className="mt-3 text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    </SiteLayout>
  ),
});

function HomePage() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const featured = products.filter((product) => product.isAvailable).slice(0, 4);
  const categories = Array.from(new Set(products.map((product) => product.category))).slice(0, 6);

  return (
    <SiteLayout>
      <section className="bg-emerald-glow relative overflow-hidden border-b border-border/60">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              Sourced. Paid for. Delivered.
            </span>
            <h1 className="text-balance-tight mt-6 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
              Order everyday goods. We handle the hustle.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              Pick what you need, pay securely online, and our team sources it and gets it to
              your door. No queues, no market stress.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className={buttonPrimary}>
                Start shopping
              </Link>
              <Link to="/contact" className={buttonGhost}>
                Talk to our team
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-border/70 shadow-glow">
              <img
                src={heroImage}
                alt="Rice, palm oil, a cooking pot and a rechargeable fan arranged on a green background"
                width={1280}
                height={960}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Pick your items",
              body: "Browse what is available today with clear prices, no haggling.",
            },
            {
              title: "Pay securely",
              body: "Checkout with card or transfer through Paystack. You get a reference instantly.",
            },
            {
              title: "We deliver",
              body: "Our team sources the goods, arranges dispatch and keeps you posted.",
            },
          ].map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="text-sm font-bold text-primary">0{index + 1}</span>
              <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Available now</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Fresh stock our team can source for you today.
            </p>
          </div>
          <Link to="/shop" className={buttonGhost}>
            See all products
          </Link>
        </div>

        {featured.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
            New products are being added. Please check back shortly.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {categories.length > 0 ? (
          <div className="mt-12 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category}
                to="/shop"
                search={{ category }}
                className="rounded-full border border-border bg-panel px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
              >
                {category}
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </SiteLayout>
  );
}
