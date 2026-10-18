import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/list-your-business")({
  head: () => ({
    meta: [{ title: "List your business — 9JA Vendors" }],
  }),
  component: ListBusinessPage,
});

function ListBusinessPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold">Vendor onboarding coming soon</h1>
        <p className="mt-4 text-muted-foreground">
          For now, explore the product catalogue of authentic Nigerian goods. Contact us if you represent a Nigerian vendor who wants to be featured.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/categories">Browse products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
