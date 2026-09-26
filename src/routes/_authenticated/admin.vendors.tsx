import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { adminListVendors, updateVendorDirectoryStatus } from "@/lib/tradefair.functions";
import { formatNaira } from "@/lib/money";
import { buttonSmall } from "@/components/ui-classes";

export const Route = createFileRoute("/_authenticated/admin/vendors")({
  head: () => ({ meta: [{ title: "Vendors | 9Ja Vendors staff" }] }),
  component: VendorsPage,
});

function VendorsPage() {
  const listVendors = useServerFn(adminListVendors);
  const updateStatus = useServerFn(updateVendorDirectoryStatus);
  const queryClient = useQueryClient();
  const { data: vendors, isLoading } = useQuery({ queryKey: ["admin-vendors"], queryFn: () => listVendors() });
  const mutation = useMutation({
    mutationFn: (input: { id: string; isVerified: boolean; isListed: boolean }) => updateStatus({ data: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-vendors"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Vendors</h1>
      <p className="mt-1 text-sm text-muted-foreground">Verify vendors and choose who appears in the public directory. Phone numbers and owner names stay private.</p>
      {isLoading ? <p className="mt-6 text-sm" role="status">Loading vendors…</p> : null}
      {vendors && vendors.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">No vendors yet. Register one from Trade Fair.</p> : null}
      {vendors && vendors.length > 0 ? (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Registered vendors</caption>
            <thead className="bg-panel text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th scope="col" className="p-3">Vendor</th>
                <th scope="col" className="p-3">Owner / phone</th>
                <th scope="col" className="p-3">Volume</th>
                <th scope="col" className="p-3">Verified</th>
                <th scope="col" className="p-3">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td className="p-3"><p className="font-semibold">{v.businessName}</p><p className="font-mono text-xs text-muted-foreground">{v.vendorCode} · {v.category}</p></td>
                  <td className="p-3">{v.ownerName}<br /><span className="text-muted-foreground">{v.phone}</span></td>
                  <td className="p-3">{formatNaira(v.transactionVolume)}</td>
                  <td className="p-3">
                    <button type="button" className={buttonSmall} aria-pressed={v.isVerified} disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ id: v.id, isVerified: !v.isVerified, isListed: v.isVerified ? false : v.isListed })}>
                      {v.isVerified ? "Verified" : "Verify"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button type="button" className={buttonSmall} aria-pressed={v.isListed} disabled={mutation.isPending || !v.isVerified}
                      onClick={() => mutation.mutate({ id: v.id, isVerified: v.isVerified, isListed: !v.isListed })}>
                      {v.isListed ? "Public" : "Hidden"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {mutation.error ? <p role="alert" className="mt-4 text-sm text-destructive">{mutation.error.message}</p> : null}
    </div>
  );
}
