import { MapPin } from "lucide-react";

export function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-bold ${inverse ? "text-ink-foreground" : "text-foreground"}`}>
      <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-brand"><MapPin className="size-5" strokeWidth={2.5} /></span>
      <span className={compact ? "text-base" : "text-lg"}>9JA <span className={inverse ? "text-accent" : "text-primary"}>Vendors</span></span>
    </span>
  );
}
