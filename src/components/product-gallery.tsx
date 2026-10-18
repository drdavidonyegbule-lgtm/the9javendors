import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type ProductGalleryProps = {
  images: string[];
  alt?: string;
};

export function ProductGallery({ images, alt = "Product image" }: ProductGalleryProps) {
  const list = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [list.join("|")]);

  if (list.length === 0) {
    return (
      <div className="aspect-[4/3] w-full rounded-lg bg-muted" aria-hidden />
    );
  }

  const current = list[Math.min(index, list.length - 1)]!;
  const hasMultiple = list.length > 1;

  function prev() {
    setIndex((i) => (i - 1 + list.length) % list.length);
  }
  function next() {
    setIndex((i) => (i + 1) % list.length);
  }

  return (
    <div className="w-full">
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        <img
          key={current}
          src={current}
          alt={alt}
          width={1536}
          height={896}
          className="h-full w-full object-cover"
        />
        {hasMultiple && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 shadow-card sm:inline-flex"
              aria-label="Previous image"
              onClick={prev}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 shadow-card sm:inline-flex"
              aria-label="Next image"
              onClick={next}
            >
              <ChevronRight className="size-5" />
            </Button>
          </>
        )}
      </div>
      {hasMultiple && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                i === index ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {hasMultiple && (
        <div className="mt-2 flex justify-center gap-1.5 sm:hidden">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2 w-2 rounded-full ${i === index ? "bg-primary" : "bg-muted-foreground/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
