import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AdminShell } from "@/components/AdminShell";
import { getStaffStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
  errorComponent: () => (
    <AdminShell>
      <p className="text-sm text-muted-foreground">
        Something went wrong loading this page. Please refresh and try again.
      </p>
    </AdminShell>
  ),
});

function AdminLayout() {
  const fetchStatus = useServerFn(getStaffStatus);
  const { data, isPending } = useQuery({
    queryKey: ["staff-status"],
    queryFn: () => fetchStatus(),
    retry: false,
  });

  if (isPending) {
    return (
      <AdminShell>
        <p className="text-sm text-muted-foreground">Checking your access…</p>
      </AdminShell>
    );
  }

  if (!data?.isStaff) {
    return (
      <AdminShell>
        <div className="rounded-2xl border border-border bg-card p-8">
          <h1 className="text-xl font-bold">You do not have staff access yet</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account {data?.email ? `(${data.email})` : ""} is signed in but has not been given
            staff permission. Ask an administrator to grant your account access, then reload this
            page.
          </p>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
