import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";

import { VENDOR_CATEGORIES } from "@/lib/directory.functions";
import { adminListEventSales, adminListVendors, onboardVendor, recordEventSale } from "@/lib/tradefair.functions";
import { formatNaira } from "@/lib/money";
import { buttonPrimary, cardBase, inputBase, labelBase } from "@/components/ui-classes";

export const Route = createFileRoute("/_authenticated/admin/trade-fair")({
  head: () => ({ meta: [{ title: "Trade fair terminal | 9Ja Vendors staff" }] }),
  component: TradeFairPage,
});

function TradeFairPage() {
  const queryClient = useQueryClient();
  const listVendors = useServerFn(adminListVendors);
  const listSales = useServerFn(adminListEventSales);
  const onboard = useServerFn(onboardVendor);
  const recordSale = useServerFn(recordEventSale);
  const { data: vendors } = useQuery({ queryKey: ["admin-vendors"], queryFn: () => listVendors() });
  const { data: sales } = useQuery({ queryKey: ["event-sales"], queryFn: () => listSales() });

  const [vendor, setVendor] = useState({ ownerName: "", businessName: "", category: VENDOR_CATEGORIES[0] as string, phone: "", storefrontUrl: "" });
  const [sale, setSale] = useState({ vendorId: "", amount: "", paymentReference: "" });

  const onboardMutation = useMutation({
    mutationFn: () => onboard({ data: vendor }),
    onSuccess: (created) => {
      setVendor({ ownerName: "", businessName: "", category: VENDOR_CATEGORIES[0], phone: "", storefrontUrl: "" });
      setSale((s) => ({ ...s, vendorId: created.id }));
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
    },
  });
  const saleMutation = useMutation({
    mutationFn: () => recordSale({ data: { vendorId: sale.vendorId, amount: Number(sale.amount), paymentReference: sale.paymentReference } }),
    onSuccess: () => {
      setSale((s) => ({ ...s, amount: "", paymentReference: "" }));
      queryClient.invalidateQueries({ queryKey: ["event-sales"] });
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      queryClient.invalidateQueries({ queryKey: ["platform-stats"] });
    },
  });

  function submitVendor(e: FormEvent) { e.preventDefault(); onboardMutation.mutate(); }
  function submitSale(e: FormEvent) { e.preventDefault(); saleMutation.mutate(); }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Trade fair terminal</h1>
      <p className="mt-1 text-sm text-muted-foreground">Register vendors on the floor and record cash-free sales. Commission is set in Settings and calculated on the server.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={submitVendor} className={cardBase} aria-labelledby="reg-title">
          <h2 id="reg-title" className="text-lg font-bold">1. Register vendor</h2>
          <div className="mt-4 grid gap-4">
            <div><label htmlFor="ownerName" className={labelBase}>Full name</label><input id="ownerName" required minLength={2} maxLength={120} className={inputBase} value={vendor.ownerName} onChange={(e) => setVendor({ ...vendor, ownerName: e.target.value })} /></div>
            <div><label htmlFor="businessName" className={labelBase}>Business name</label><input id="businessName" required minLength={2} maxLength={140} className={inputBase} value={vendor.businessName} onChange={(e) => setVendor({ ...vendor, businessName: e.target.value })} /></div>
            <div><label htmlFor="category" className={labelBase}>Category</label>
              <select id="category" className={inputBase} value={vendor.category} onChange={(e) => setVendor({ ...vendor, category: e.target.value })}>
                {VENDOR_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
            <div><label htmlFor="phone" className={labelBase}>Phone number</label><input id="phone" type="tel" required inputMode="tel" pattern="[+()\-\s0-9]{7,30}" className={inputBase} value={vendor.phone} onChange={(e) => setVendor({ ...vendor, phone: e.target.value })} /></div>
            <div><label htmlFor="storefrontUrl" className={labelBase}>Storefront link (optional)</label><input id="storefrontUrl" type="url" className={inputBase} value={vendor.storefrontUrl} onChange={(e) => setVendor({ ...vendor, storefrontUrl: e.target.value })} /></div>
          </div>
          <button type="submit" className={`${buttonPrimary} mt-5`} disabled={onboardMutation.isPending}>{onboardMutation.isPending ? "Registering…" : "Register vendor"}</button>
          <div role="status" className="mt-3 text-sm">
            {onboardMutation.data ? <p className="font-semibold text-primary">Registered {onboardMutation.data.businessName}. Vendor ID: <span className="font-mono">{onboardMutation.data.vendorCode}</span></p> : null}
            {onboardMutation.error ? <p className="text-destructive">{onboardMutation.error.message}</p> : null}
          </div>
        </form>

        <form onSubmit={submitSale} className={cardBase} aria-labelledby="sale-title">
          <h2 id="sale-title" className="text-lg font-bold">2. Record floor sale</h2>
          <div className="mt-4 grid gap-4">
            <div><label htmlFor="vendorId" className={labelBase}>Vendor</label>
              <select id="vendorId" required className={inputBase} value={sale.vendorId} onChange={(e) => setSale({ ...sale, vendorId: e.target.value })}>
                <option value="">Choose a vendor</option>
                {(vendors ?? []).map((v) => <option key={v.id} value={v.id}>{v.vendorCode} · {v.businessName}</option>)}
              </select></div>
            <div><label htmlFor="amount" className={labelBase}>Amount (₦)</label><input id="amount" type="number" min="1" step="0.01" required className={inputBase} value={sale.amount} onChange={(e) => setSale({ ...sale, amount: e.target.value })} /></div>
            <div><label htmlFor="ref" className={labelBase}>Payment reference</label><input id="ref" required pattern="[A-Za-z0-9._\-]{3,120}" className={inputBase} value={sale.paymentReference} onChange={(e) => setSale({ ...sale, paymentReference: e.target.value })} /></div>
          </div>
          <button type="submit" className={`${buttonPrimary} mt-5`} disabled={saleMutation.isPending}>{saleMutation.isPending ? "Recording…" : "Record sale"}</button>
          <div role="status" className="mt-3 text-sm">
            {saleMutation.data ? <p className="font-semibold text-primary">Sale recorded. Commission: {formatNaira(saleMutation.data.commissionAmount)}</p> : null}
            {saleMutation.error ? <p className="text-destructive">{saleMutation.error.message}</p> : null}
          </div>
        </form>
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5">
        <h2 className="text-lg font-bold">Recent event sales</h2>
        {!sales || sales.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No sales recorded yet.</p> : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted-foreground"><tr><th scope="col" className="py-2">Vendor</th><th scope="col">Reference</th><th scope="col">Amount</th><th scope="col">Commission</th><th scope="col">Date</th></tr></thead>
              <tbody className="divide-y divide-border">
                {sales.slice(0, 20).map((s) => (
                  <tr key={s.id}><td className="py-2">{s.businessName}</td><td className="font-mono text-xs">{s.paymentReference}</td><td>{formatNaira(s.amount)}</td><td>{formatNaira(s.commissionAmount)}</td><td>{new Date(s.createdAt).toLocaleString("en-NG")}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
