import { Link } from "@tanstack/react-router";
import { MapPin, Package } from "lucide-react";
import { Button } from "./ui/button";
import type { MarketplaceProduct } from "@/lib/marketplace-data";

export function ProductCard({ product }: { product: MarketplaceProduct }) {
  const inStock = product.quantity > 0;
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-card shadow-card transition-transform duration-300 hover:-translate-y-1">
      <Link to="/products/$id" params={{ id: product.id }} className="block">
        <div className="aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            width={1536}
            height={896}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4 sm:p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-card-foreground sm:text-lg">
          <Link to="/products/$id" params={{ id: product.id }} className="hover:text-primary">
            {product.title}
          </Link>
        </h3>
        <p className="mt-2 text-lg font-bold text-primary">₦{product.price.toLocaleString("en-NG")}</p>
        {product.variants && product.variants.length > 1 && (
          <p className="mt-1 text-xs font-medium text-primary">+{product.variants.length} colours</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="size-3.5" />
          {inStock ? `${product.quantity} available` : "Out of stock"}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">{product.description}</p>
        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {product.location} · {product.vendorName}
        </p>
        <Button variant="outline" className="mt-4 w-full" asChild>
          <Link to="/products/$id" params={{ id: product.id }}>View product</Link>
        </Button>
      </div>
    </article>
  );
}
