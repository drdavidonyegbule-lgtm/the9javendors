import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

/** Legacy component — product marketplace uses ProductCard instead. */
export function VendorCard({ vendor }: { vendor: { slug: string; name: string; image?: string; category?: string; location?: string; description?: string } }) {
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-bold">{vendor.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{vendor.description}</p>
      <Button variant="outline" className="mt-4 w-full" asChild>
        <Link to="/categories">Browse products</Link>
      </Button>
    </article>
  );
}
