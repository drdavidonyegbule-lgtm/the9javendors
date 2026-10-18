import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Search, ShieldCheck, Sparkles, Package, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { categories, slides } from "@/lib/marketplace-data";
import { useProducts } from "@/lib/use-products";
import { FaqList } from "./faq";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "9JA Vendors — Authentic Nigerian products" },
      { name: "description", content: "Shop authentic Nigerian products — fashion, Ankara, foodstuff, FMCG, home appliances and more from trusted local vendors." },
      { property: "og:title", content: "9JA Vendors — Authentic Nigerian products" },
      { property: "og:description", content: "Product marketplace promoting authentic Nigerian vendors with clear prices and real stock." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const allProducts = useProducts();
  const [slide, setSlide] = useState(0);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((s) => (s + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const visible = useMemo(
    () =>
      allProducts.filter(
        (p) =>
          (category === "All" || p.category === category) &&
          `${p.title} ${p.category} ${p.location} ${p.description} ${p.vendorName}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [allProducts, category, search],
  );

  const suggestions = search.trim()
    ? allProducts
        .filter((p) =>
          `${p.title} ${p.category} ${p.location}`.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  return (
    <PageShell>
      <section
        className="relative isolate flex min-h-[530px] items-center overflow-hidden bg-ink text-ink-foreground sm:min-h-[570px]"
        aria-label="Featured stories"
      >
        {slides.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt={item.eyebrow}
            width={1536}
            height={896}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              slide === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={slide !== index}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--ink)_0%,color-mix(in_oklab,var(--ink)_82%,transparent)_32%,transparent_85%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
              <span className="h-0.5 w-5 bg-accent" />
              {slides[slide]?.eyebrow}
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
              {slides[slide]?.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-ink-foreground/85 sm:text-lg">
              {slides[slide]?.copy}
            </p>
            <Button size="lg" variant="gold" className="mt-8 h-12" asChild>
              <a href="#products">
                Explore products <ArrowRight />
              </a>
            </Button>
          </div>
          <div className="mt-16 flex items-center justify-between sm:mt-20">
            <div className="flex items-center gap-2" aria-label="Choose featured story">
              {slides.map((item, index) => (
                <Button
                  key={item.eyebrow}
                  type="button"
                  variant="darkGhost"
                  size="icon"
                  onClick={() => setSlide(index)}
                  aria-label={`Show ${item.eyebrow} story`}
                  aria-current={slide === index ? "true" : undefined}
                  className={`h-8 w-8 rounded-full ${
                    slide === index ? "bg-accent text-accent-foreground" : "bg-ink-foreground/20"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="darkGhost"
                size="icon"
                aria-label="Previous story"
                onClick={() => setSlide((slide + slides.length - 1) % slides.length)}
              >
                <ChevronLeft />
              </Button>
              <Button
                variant="darkGhost"
                size="icon"
                aria-label="Next story"
                onClick={() => setSlide((slide + 1) % slides.length)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-b border-border bg-card" data-tour="search">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold text-primary">FIND PRODUCTS</p>
            <p className="text-lg font-semibold">What are you looking for?</p>
          </div>
          <div className="relative w-full md:max-w-2xl">
            <div className="flex h-12 items-center rounded-md border border-input bg-background px-4 focus-within:ring-2 focus-within:ring-ring">
              <Search className="mr-3 size-5 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => window.setTimeout(() => setFocused(false), 180)}
                placeholder="Search products, categories or locations..."
                aria-label="Search products, categories or locations"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <Button variant="ghost" size="icon" aria-label="Clear search" onClick={() => setSearch("")}>
                  <X />
                </Button>
              )}
            </div>
            {focused && suggestions.length > 0 && (
              <div className="absolute top-full z-20 mt-1 w-full rounded-md border border-border bg-popover p-2 shadow-card">
                {suggestions.map((product) => (
                  <Link
                    key={product.id}
                    to="/products/$id"
                    params={{ id: product.id }}
                    className="flex items-center justify-between rounded px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span className="line-clamp-1">{product.title}</span>
                    <span className="ml-2 shrink-0 text-muted-foreground">
                      ₦{product.price.toLocaleString("en-NG")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Explore your interests</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Browse by category</h2>
          </div>
          <Link
            to="/categories"
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </section>

      <section id="products" className="bg-muted/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">From Nigerian vendors</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Featured products</h2>
              <p className="mt-3 text-muted-foreground">
                Clear prices, real quantities, and authentic local sellers.
              </p>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {visible.length} {visible.length === 1 ? "product" : "products"}
            </p>
          </div>
          {visible.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Search className="mx-auto size-9 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-bold">No products found</h3>
              <p className="mt-2 text-muted-foreground">Try another search or category.</p>
              <Button
                className="mt-5"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">FAQ</p>
        <h2 className="mt-3 text-3xl font-bold">Questions, answered</h2>
        <div className="mt-8">
          <FaqList />
        </div>
        <Link to="/faq" className="mt-6 inline-block font-semibold text-primary hover:underline">
          See all FAQs
        </Link>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Why 9JA Vendors</p>
          <h2 className="mt-3 max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            Authentic Nigerian products, listed with clarity.
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-muted-foreground">
            We promote the authenticity of Nigerian vendors. Every product shows price, available quantity and who is selling — so you can buy with confidence.
          </p>
          <Button className="mt-7" asChild>
            <Link to="/how-it-works">
              How it works <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="border-l-2 border-primary pl-5">
            <ShieldCheck className="size-7 text-primary" />
            <h3 className="mt-4 font-bold">Authentic vendors</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Listings celebrate real Nigerian sellers and makers.
            </p>
          </div>
          <div className="border-l-2 border-accent pl-5">
            <Package className="size-7 text-primary" />
            <h3 className="mt-4 font-bold">Product-first</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Browse by product images, prices and stock — like a modern marketplace.
            </p>
          </div>
          <div className="border-l-2 border-accent pl-5">
            <MapPin className="size-7 text-primary" />
            <h3 className="mt-4 font-bold">Rooted locally</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Goods from cities and markets across Nigeria.
            </p>
          </div>
          <div className="border-l-2 border-primary pl-5">
            <Sparkles className="size-7 text-primary" />
            <h3 className="mt-4 font-bold">Fair prices</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Affordable naira prices shown upfront on every item.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink py-14 text-ink-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Shop authentic</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Discover products from Nigerian vendors.</h2>
          </div>
          <Button variant="gold" size="lg" asChild>
            <Link to="/categories">
              Browse all products <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
