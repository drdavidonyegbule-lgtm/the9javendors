import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/marketplace-data";
import { useProducts } from "@/lib/use-products";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Browse products & categories — 9JA Vendors" },
      { name: "description", content: "Explore authentic Nigerian products by category — fashion, Ankara, foodstuff, FMCG, appliances and more." },
      { property: "og:title", content: "Browse products & categories — 9JA Vendors" },
      { property: "og:description", content: "Find products from authentic Nigerian vendors with clear prices and stock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const allProducts = useProducts();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          `${p.title} ${p.category} ${p.location} ${p.vendorName} ${p.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [allProducts, category, query],
  );

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Discover Nigeria</p>
        <h1 className="mt-3 text-4xl font-bold">Explore products</h1>
        <p className="mt-3 text-muted-foreground">
          Shop by category — fashion, fabrics, foodstuff, home goods and everyday essentials from authentic Nigerian vendors.
        </p>

        <div className="mt-9 flex h-12 max-w-xl items-center rounded-md border border-input bg-card px-4">
          <Search className="mr-3 size-5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, category or location"
            aria-label="Search products"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <Button variant="ghost" size="icon" onClick={() => setQuery("")} aria-label="Clear search">
              <X />
            </Button>
          )}
        </div>

        <div className="mt-7 flex flex-wrap gap-2">
          {categories.map((item) => (
            <Button
              key={item}
              variant={category === item ? "default" : "outline"}
              onClick={() => setCategory(item)}
              aria-pressed={category === item}
            >
              {item}
            </Button>
          ))}
        </div>

        <p className="mb-5 mt-10 text-sm font-medium text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        {filtered.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl font-bold">No matching products</p>
            <p className="mt-2 text-muted-foreground">Try a different search.</p>
            <Button
              className="mt-5"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Show all products
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  );
}
