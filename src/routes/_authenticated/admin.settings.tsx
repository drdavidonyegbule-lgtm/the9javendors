import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { adminGetSettings } from "@/lib/admin.functions";
import { formatNaira } from "@/lib/money";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const fetchSettings = useServerFn(adminGetSettings);
  const { data, isPending } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings(),
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Editing is still being built. These are the current store settings.
      </p>

      {isPending ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading settings…</p>
      ) : (
        <dl className="mt-6 flex flex-col gap-4 text-sm">
          <Row label="Store name" value={data?.storeName} />
          <Row label="Phone" value={data?.storePhone} />
          <Row label="WhatsApp" value={data?.storeWhatsapp} />
          <Row label="Email" value={data?.storeEmail} />
          <Row label="Address" value={data?.storeAddress} />
          <Row label="Standard delivery fee" value={formatNaira(data?.deliveryFee ?? 0)} />
          <Row label="New order alerts sent to" value={data?.alertEmail} />
        </dl>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value || "—"}</dd>
    </div>
  );
}
