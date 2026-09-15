import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { adminGetStats, adminListOrders } from "@/lib/admin.functions";
import { ORDER_STATUSES } from "@/lib/admin.functions";
import { formatNaira } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: DashboardPage,
});

function statusLabel(value: string): string {
  return ORDER_STATUSES.find((status) => status.value === value)?.label ?? value;
}

function DashboardPage() {
  const fetchStats = useServerFn(adminGetStats);
  const fetchOrders = useServerFn(adminListOrders);

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats() });
  const { data: orders } = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetchOrders() });

  const cards = [
    { label: "Total orders", value: stats ? String(stats.totalOrders) : "—" },
    { label: "New orders", value: stats ? String(stats.newOrders) : "—" },
    { label: "Processing", value: stats ? String(stats.processingOrders) : "—" },
    { label: "Delivered", value: stats ? String(stats.deliveredOrders) : "—" },
    { label: "Total sales", value: stats ? formatNaira(stats.totalSales) : "—" },
  ];

  const recent = (orders ?? []).slice(0, 6);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Latest orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">
            View all orders
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-5 text-sm text-muted-foreground">No paid orders yet.</p>
        ) : (
          <div className="mt-5 flex flex-col divide-y divide-border">
            {recent.map((order) => (
              <Link
                key={order.id}
                to="/admin/orders/$id"
                params={{ id: order.id }}
                className="flex flex-wrap items-center justify-between gap-3 py-3 hover:text-primary"
              >
                <span className="text-sm font-semibold">{order.orderNumber}</span>
                <span className="text-sm text-muted-foreground">{order.customerName}</span>
                <span className="text-sm text-muted-foreground">{statusLabel(order.status)}</span>
                <span className="text-sm font-bold">{formatNaira(order.total)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
