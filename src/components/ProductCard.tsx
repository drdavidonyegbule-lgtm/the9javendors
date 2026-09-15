import { Link } from "@tanstack/react-router";

import { formatNaira } from "@/lib/money";
import type { PublicProduct } from "@/lib/shop.functions";

export function ProductCard({ product }: { product: PublicProduct }) {
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/60 hover:shadow-glow"
    >
      <div className="aspect-4/3 overflow-hidden bg-surface">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-sm font-medium text-surface-foreground/60">
            Photo coming soon
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">
          {product.category}
        </span>
        <h3 className="text-base font-semibold leading-snug">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-lg font-bold">{formatNaira(product.price)}</span>
          {product.isAvailable ? (
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              View
            </span>
          ) : (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
