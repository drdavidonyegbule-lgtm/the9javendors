import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode === "register" ? ("register" as const) : ("login" as const),
  }),
  head: () => ({
    meta: [{ title: "Accounts — 9JA Vendors" }, { name: "description", content: "Browse products on 9JA Vendors without an account." }],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold">No sign-in required</h1>
        <p className="mt-4 text-muted-foreground">
          9JA Vendors is open to browse. Explore authentic Nigerian products, prices and stock without creating an account.
        </p>
        <Button className="mt-8" size="lg" asChild>
          <Link to="/categories">Browse products</Link>
        </Button>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/" className="font-semibold text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
