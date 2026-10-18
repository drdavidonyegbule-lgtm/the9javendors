import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [{ name: "description", content: 'Browse Nigerian products without a customer account.' }, { property: "og:title", content: 'Account — 9JA Vendors' }, { property: "og:description", content: 'Browse Nigerian products without a customer account.' }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },{ name: "robots", content: "noindex" },{ title: "Account — 9JA Vendors" }],
  }),
  component: AccountPage,
});

function AccountPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold">Accounts are not required</h1>
        <p className="mt-4 text-muted-foreground">
          This marketplace focuses on product discovery. You can browse all listings without signing in.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/categories">Browse products</Link>
        </Button>
      </div>
    </PageShell>
  );
}
