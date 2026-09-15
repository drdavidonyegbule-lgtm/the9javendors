import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { ORDER_STATUSES, adminListOrders } from "@/lib/admin.functions";
import { formatNaira } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/orders/")({
  component: OrdersPage,
});

function OrdersPage() {
  const fetchOrders = useServerFn(adminListOrders);
  const { data: orders, isPending } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Orders</h1>

      {isPending ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading orders…</p>
      ) : (orders ?? []).length === 0 ? (
        <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          No paid orders yet.
        </p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {(orders ?? []).map((order) => (
            <Link
              key={order.id}
              to="/admin/orders/$id"
              params={{ id: order.id }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/60"
            >
              <div>
                <p className="text-sm font-semibold">{order.orderNumber}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="min-w-40">
                <p className="text-sm">{order.customerName}</p>
                <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
              </div>
              <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                {ORDER_STATUSES.find((status) => status.value === order.status)?.label ??
                  order.status}
              </span>
              <span className="text-sm font-bold">{formatNaira(order.total)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
