import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h1 className="text-2xl font-extrabold">Order details</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This page is still being built. The orders list already shows customer, status and amount.
      </p>
      <Link to="/admin/orders" className="mt-6 inline-block text-sm text-primary hover:underline">
        Back to orders
      </Link>
    </div>
  );
}
