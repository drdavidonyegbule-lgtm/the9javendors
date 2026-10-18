import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/vendors/$slug")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [{ property: "og:title", content: 'Products — 9JA Vendors' }, { property: "og:description", content: 'Browse authentic Nigerian products on 9JA Vendors.' }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },{ name: "robots", content: "noindex" },
      { title: "Products — 9JA Vendors" },
      { name: "description", content: "Browse authentic Nigerian products on 9JA Vendors." },
    ],
  }),
  component: LegacyVendorRedirect,
});

/** Vendor profile pages removed — product-first marketplace. */
function LegacyVendorRedirect() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold">Product catalogue</h1>
        <p className="mt-4 text-muted-foreground">
          9JA Vendors is product-first. Browse items by category instead of vendor profile pages.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/categories">Browse products</Link>
        </Button>
      </div>
    </PageShell>
  );
}
