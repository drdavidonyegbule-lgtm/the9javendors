import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { ProductCard } from "@/components/ProductCard";
import { SiteLayout } from "@/components/SiteLayout";
import { listProducts } from "@/lib/shop.functions";

const productsQuery = queryOptions({
  queryKey: ["products", "public"],
  queryFn: () => listProducts(),
});

type ShopSearch = { category?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(productsQuery);
  },
  head: () => ({
    meta: [
      { title: "Shop all products — 9Ja Vendors" },
      {
        name: "description",
        content:
          "Every product 9Ja Vendors can source for you right now, with clear prices and secure online payment.",
      },
      { property: "og:title", content: "Shop all products — 9Ja Vendors" },
      {
        property: "og:description",
        content: "Every product 9Ja Vendors can source for you right now, with clear prices.",
      },
    ],
  }),
  component: ShopPage,
  errorComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="text-2xl font-bold">We could not load the products</h1>
        <p className="mt-3 text-muted-foreground">Please refresh the page and try again.</p>
      </div>
    </SiteLayout>
  ),
});

function ShopPage() {
  const { category } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQuery);

  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  const visible = category
    ? products.filter((product) => product.category === category)
    : products;

  return (
    <SiteLayout>
      <div className="border-b border-border/60 bg-emerald-glow">
        <div className="mx-auto w-full max-w-6xl px-5 py-12">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Shop</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Everything below can be sourced and delivered by our team. Prices include sourcing;
            delivery is added at checkout.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-5 py-10">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/shop"
            className={`rounded-full border px-4 py-2 text-sm transition ${
              category
                ? "border-border text-muted-foreground hover:text-foreground"
                : "border-primary bg-primary/15 font-semibold text-primary"
            }`}
          >
            All
          </Link>
          {categories.map((item) => (
            <Link
              key={item}
              to="/shop"
              search={{ category: item }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                category === item
                  ? "border-primary bg-primary/15 font-semibold text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item}
            </Link>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
            Nothing here yet. Please check back soon or contact us with what you need.
          </p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
