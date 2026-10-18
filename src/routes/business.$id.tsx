import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/business/$id")({
  head: () => ({ meta: [{ title: "Business — 9JA Vendors" }] }),
  component: BusinessPage,
});

function BusinessPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold">Business management unavailable</h1>
        <p className="mt-4 text-muted-foreground">
          Account and business management features have been removed from this product-focused experience.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/categories">Browse products</Link>
        </Button>
      </div>
    </PageShell>
  );
}
