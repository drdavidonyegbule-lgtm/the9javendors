import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { SiteLayout } from "@/components/SiteLayout";
import { VENDOR_CATEGORIES, listDirectoryVendors } from "@/lib/directory.functions";
import { formatNaira } from "@/lib/money";

type Search = { category?: (typeof VENDOR_CATEGORIES)[number] | undefined };

const directoryQuery = (category?: string) =>
  queryOptions({
    queryKey: ["directory", category ?? "all"],
    queryFn: () => listDirectoryVendors({ data: { category } }),
  });

export const Route = createFileRoute("/directory")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const value = search["category"];
    return {
      category: VENDOR_CATEGORIES.find((item) => item === value),
    };
  },
  loaderDeps: ({ search }) => ({ category: search.category }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(directoryQuery(deps.category)),
  head: () => ({
    meta: [
      { title: "Verified Nigerian vendor directory | 9Ja Vendors" },
      { name: "description", content: "Browse verified 9Ja Vendors merchants by category, with vendor IDs and recorded trade volume." },
      { property: "og:title", content: "Verified Nigerian vendor directory | 9Ja Vendors" },
      { property: "og:description", content: "Browse verified merchants by category, with vendor IDs and recorded trade volume." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DirectoryPage,
  errorComponent: () => (
    <SiteLayout>
      <p className="mx-auto max-w-3xl px-5 py-24 text-center">The directory could not load. Please refresh.</p>
    </SiteLayout>
  ),
  notFoundComponent: () => <SiteLayout><p className="p-10">Not found.</p></SiteLayout>,
});

function DirectoryPage() {
  const { category } = Route.useSearch();
  const { data: vendors } = useSuspenseQuery(directoryQuery(category));
  const pill = (active: boolean) =>
    `rounded-md border px-4 py-2 text-sm ${active ? "border-primary bg-primary font-semibold text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`;

  return (
    <SiteLayout>
      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Merchant marketplace</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Vendor directory</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Only vendors checked and approved by our staff appear here. Volume shows sales recorded through 9Ja Vendors.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <nav aria-label="Vendor categories" className="flex flex-wrap gap-2">
          <Link to="/directory" className={pill(!category)}>All</Link>
          {VENDOR_CATEGORIES.map((item) => (
            <Link key={item} to="/directory" search={{ category: item }} className={pill(category === item)}>
              {item}
            </Link>
          ))}
        </nav>
        {vendors.length === 0 ? (
          <p className="mt-10 rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
            No verified vendors in this category yet.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendors.map((vendor) => (
              <li key={vendor.vendorCode} className="rounded-lg border-l-4 border-primary bg-card p-5 ring-1 ring-border">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{vendor.category}</p>
                <h2 className="mt-1 text-lg font-bold">{vendor.businessName}</h2>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Vendor ID</dt>
                  <dd className="font-mono">{vendor.vendorCode}</dd>
                  <dt className="text-muted-foreground">Recorded volume</dt>
                  <dd className="font-semibold">{formatNaira(vendor.transactionVolume)}</dd>
                </dl>
                {vendor.storefrontUrl ? (
                  <a href={vendor.storefrontUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-primary underline">
                    Visit storefront<span className="sr-only"> for {vendor.businessName} (opens in new tab)</span>
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </SiteLayout>
  );
}
