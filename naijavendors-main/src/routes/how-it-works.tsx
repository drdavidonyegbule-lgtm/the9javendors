import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package, Search, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — 9JA Vendors" },
      { name: "description", content: "Learn how 9JA Vendors helps you discover authentic Nigerian products with clear prices and stock." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const steps = [
    {
      icon: Search,
      title: "Browse products",
      body: "Explore categories like fashion, Ankara, foodstuff, FMCG and home appliances. Search by name, category or location.",
    },
    {
      icon: Package,
      title: "Check price & stock",
      body: "Every product shows description, available quantity and an affordable price in naira — so you know what is in stock.",
    },
    {
      icon: ShieldCheck,
      title: "Buy from authentic vendors",
      body: "Listings highlight Nigerian sellers. Enquire about a product and arrange payment and delivery directly with the vendor.",
    },
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Simple by design</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold">How 9JA Vendors works</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A product-first marketplace that promotes the authenticity of Nigerian vendors — without forcing accounts to browse.
        </p>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-lg border border-border bg-card p-6 shadow-card">
              <p className="text-xs font-bold text-primary">Step {i + 1}</p>
              <step.icon className="mt-4 size-8 text-primary" />
              <h2 className="mt-4 text-xl font-bold">{step.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <Button className="mt-12" size="lg" asChild>
          <Link to="/categories">
            Start browsing products <ArrowRight />
          </Link>
        </Button>
      </div>
    </PageShell>
  );
}
