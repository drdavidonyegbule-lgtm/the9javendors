import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { buttonPrimary, buttonSmall } from "@/components/ui-classes";
import { adminDeleteProduct, adminListProducts, adminSaveProduct } from "@/lib/admin.functions";
import { formatNaira } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const fetchProducts = useServerFn(adminListProducts);
  const saveProduct = useServerFn(adminSaveProduct);
  const deleteProduct = useServerFn(adminDeleteProduct);

  const { data: products, isPending } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetchProducts(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    queryClient.invalidateQueries({ queryKey: ["products", "public"] });
  };

  const toggle = useMutation({
    mutationFn: (input: Parameters<typeof saveProduct>[0]) => saveProduct(input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: invalidate,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Products</h1>
        <Link to="/admin/products/$id" params={{ id: "new" }} className={buttonPrimary}>
          Add product
        </Link>
      </div>

      {isPending ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading products…</p>
      ) : (products ?? []).length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No products yet. Add your first one.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {(products ?? []).map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-surface">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold">{product.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {product.category} · {formatNaira(product.price)}
                  {product.supplierName ? ` · supplier: ${product.supplierName}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    product.isHidden
                      ? "bg-secondary text-muted-foreground"
                      : product.isAvailable
                        ? "bg-primary/15 text-primary"
                        : "bg-destructive/15 text-foreground"
                  }`}
                >
                  {product.isHidden
                    ? "Hidden"
                    : product.isAvailable
                      ? "Available"
                      : "Unavailable"}
                </span>
                <button
                  type="button"
                  className={buttonSmall}
                  disabled={toggle.isPending}
                  onClick={() =>
                    toggle.mutate({
                      data: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        category: product.category,
                        imagePath: product.imagePath,
                        imageUrl: product.imageUrl,
                        isAvailable: !product.isAvailable,
                        isHidden: product.isHidden,
                        supplierName: product.supplierName,
                        supplierPhone: product.supplierPhone,
                        supplierCost: product.supplierCost,
                      },
                    })
                  }
                >
                  {product.isAvailable ? "Mark unavailable" : "Mark available"}
                </button>
                <button
                  type="button"
                  className={buttonSmall}
                  disabled={toggle.isPending}
                  onClick={() =>
                    toggle.mutate({
                      data: {
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        category: product.category,
                        imagePath: product.imagePath,
                        imageUrl: product.imageUrl,
                        isAvailable: product.isAvailable,
                        isHidden: !product.isHidden,
                        supplierName: product.supplierName,
                        supplierPhone: product.supplierPhone,
                        supplierCost: product.supplierCost,
                      },
                    })
                  }
                >
                  {product.isHidden ? "Show in shop" : "Hide from shop"}
                </button>
                <Link
                  to="/admin/products/$id"
                  params={{ id: product.id }}
                  className={buttonSmall}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  className={buttonSmall}
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm(`Delete ${product.name}? This cannot be undone.`)) {
                      remove.mutate(product.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
