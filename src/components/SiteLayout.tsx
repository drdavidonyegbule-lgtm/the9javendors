import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { getStoreSettings } from "@/lib/shop.functions";
import { useCart } from "@/lib/cart";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/directory", label: "Vendors" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteLayout({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ["store-settings"],
    queryFn: () => getStoreSettings(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:px-4 focus:py-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="adire-band" aria-hidden="true" />
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-sm font-black text-primary-foreground">
              9J
            </span>
            <span className="text-base font-bold tracking-tight">9Ja Vendors</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="text-sm text-muted-foreground transition hover:text-foreground data-[status=active]:text-foreground data-[status=active]:font-semibold"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold transition hover:bg-secondary"
            >
              Cart
              <span className="grid h-5 min-w-5 place-items-center rounded-md bg-primary px-1 text-xs font-bold text-primary-foreground">
                {itemCount}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-md border border-border px-3 py-2 text-sm md:hidden"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              Menu
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav className="flex flex-col gap-1 border-t border-border px-5 pb-4 pt-2 md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : null}
      </header>

      <main id="main" className="flex-1">{children}</main>

      <footer className="border-t border-border bg-panel">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-base font-bold">{settings?.storeName ?? "9Ja Vendors"}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Everyday goods sourced and delivered across Nigeria. Order online, pay securely,
              and our team handles the rest.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Shop</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/shop" className="hover:text-foreground">
                All products
              </Link>
              <Link to="/cart" className="hover:text-foreground">
                Your cart
              </Link>
              <Link to="/contact" className="hover:text-foreground">
                Contact us
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Policies</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">
                Terms and Conditions
              </Link>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy Policy
              </Link>
              <Link to="/returns" className="hover:text-foreground">
                Returns and Refunds
              </Link>
              <Link to="/directory" className="hover:text-foreground">
                Vendor directory
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Reach us</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
              {settings?.storePhone ? <span>{settings.storePhone}</span> : null}
              {settings?.storeEmail ? <span>{settings.storeEmail}</span> : null}
              {settings?.storeAddress ? <span>{settings.storeAddress}</span> : null}
            </div>
          </div>
        </div>
        <div className="border-t border-border px-5 py-5">
          <p className="mx-auto max-w-6xl text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} 9Ja Vendors. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
