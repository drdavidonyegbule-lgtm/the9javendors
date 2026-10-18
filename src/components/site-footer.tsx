import { Link } from "@tanstack/react-router";
import { Brand } from "./brand";
import { Button } from "./ui/button";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Brand inverse />
          <p className="mt-4 max-w-sm text-sm leading-6 text-ink-muted">
            A product marketplace that celebrates authentic Nigerian vendors — clear prices, real stock, and trusted local sellers.
          </p>
        </div>
        <div>
          <p className="text-sm font-bold">Explore</p>
          <div className="mt-4 grid gap-3 text-sm text-ink-muted">
            <Link to="/categories">Browse categories</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Shop with confidence</p>
          <p className="mt-3 text-sm text-ink-muted">Every listing highlights Nigerian sellers and transparent product details.</p>
          <Button variant="darkGhost" className="mt-3 px-0" asChild>
            <Link to="/categories">View all products</Link>
          </Button>
        </div>
      </div>
      <div className="border-t border-ink-border py-5 text-center text-xs text-ink-muted">
        © 2026 9JA Vendors. Built to celebrate Nigerian enterprise.
      </div>
    </footer>
  );
}
