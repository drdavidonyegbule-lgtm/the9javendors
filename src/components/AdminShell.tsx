import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/admin", label: "Dashboard", exact: true },
  { to: "/admin/products", label: "Products", exact: false },
  { to: "/admin/orders", label: "Orders", exact: false },
  { to: "/admin/settings", label: "Settings", exact: false },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-panel">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
              9J
            </span>
            <div>
              <p className="text-sm font-bold">9Ja Vendors</p>
              <p className="text-xs text-muted-foreground">Staff area</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              View store
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-5 pb-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm text-muted-foreground transition hover:bg-secondary data-[status=active]:bg-primary/15 data-[status=active]:font-semibold data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">{children}</main>
    </div>
  );
}
