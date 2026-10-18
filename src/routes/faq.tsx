import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { faqs } from "@/lib/faq-data";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — 9JA Vendors" },
      { name: "description", content: "Answers about browsing authentic Nigerian products, prices and stock on 9JA Vendors." },
      { property: "og:title", content: "FAQ — 9JA Vendors" },
      { property: "og:description", content: "Answers to common questions about using 9JA Vendors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FaqPage,
});

export function FaqList() {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-card">
      {faqs.map((f) => (
        <details key={f.q} className="group p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            {f.q}
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function FaqPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Help centre</p>
        <h1 className="mt-3 text-4xl font-bold">Frequently asked questions</h1>
        <p className="mt-4 text-muted-foreground">Can't find your answer? Ask our assistant using the chat button, or <Link to="/contact" className="font-semibold text-primary hover:underline">contact us</Link>.</p>
        <div className="mt-10"><FaqList /></div>
      </section>
    </PageShell>
  );
}
