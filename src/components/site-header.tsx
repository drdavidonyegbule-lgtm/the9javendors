import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/categories" as const, label: "Categories" },
  { to: "/" as const, label: "Featured products" },
  { to: "/how-it-works" as const, label: "How it works" },
  { to: "/faq" as const, label: "FAQ" },
  { to: "/contact" as const, label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="9JA Vendors home" data-tour="nav">
          <Brand />
        </Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" aria-label="Search products" asChild>
            <Link to="/categories">
              <Search />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Cart, ${totalItems} items`} className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
          </Button>
          <div className="hidden sm:block">
            <Button asChild>
              <Link to="/categories">Browse products</Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-4 py-4 sm:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Button key={link.label} variant="ghost" className="justify-start" asChild>
                <Link to={link.to} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </Button>
            ))}
            <Button variant="ghost" className="justify-start" asChild>
              <Link to="/cart" onClick={() => setOpen(false)}>
                Cart ({totalItems})
              </Link>
            </Button>
            <Button className="mt-2" asChild>
              <Link to="/categories" onClick={() => setOpen(false)}>
                Browse products
              </Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
