import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: ProductFormPage,
});

function ProductFormPage() {
  const { id } = Route.useParams();

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h1 className="text-2xl font-extrabold">
        {id === "new" ? "Add product" : "Edit product"}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        This form is still being built. For now you can change availability and visibility from the
        products list.
      </p>
      <Link to="/admin/products" className="mt-6 inline-block text-sm text-primary hover:underline">
        Back to products
      </Link>
    </div>
  );
}
