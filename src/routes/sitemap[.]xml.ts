import { createFileRoute } from "@tanstack/react-router";
import { getRouterInstance } from "@tanstack/react-start";
import { isSitemapRouteIncluded, sitemapStaticPaths, sitemapPathForLocation, sitemapXML, type SitemapEntry } from "@/lib/sitemap";

const BASE_URL = "https://9javendors.com";

export const Route = createFileRoute("/sitemap.xml")({
  staticData: { sitemap: false },
  server: {
    handlers: {
      GET: async () => {
        try {
          const router = await getRouterInstance();
          const entries: SitemapEntry[] = sitemapStaticPaths(router).map((path) => ({ path }));
          const localRouteId = "/products/$id";
          if (isSitemapRouteIncluded(router.routesById[localRouteId])) {
            const { products } = await import("@/lib/marketplace-data");
            for (const product of products) {
              const location = router.buildLocation({ to: "/products/$id", params: { id: product.id }, search: () => ({}), hash: "" });
              const path = sitemapPathForLocation(router, location, localRouteId);
              if (path) entries.push({ path });
            }
          }
          const storeRouteId = "/product/$slug";
          if (isSitemapRouteIncluded(router.routesById[storeRouteId])) {
            const { createPublicClient } = await import("@/lib/supabase-public.server");
            const { sitemapProductSlugs } = await import("@/lib/sitemap-products.server");
            const slugs = await sitemapProductSlugs(createPublicClient());
            for (const slug of slugs) {
              const location = router.buildLocation({ to: "/product/$slug", params: { slug }, search: () => ({}), hash: "" });
              const path = sitemapPathForLocation(router, location, storeRouteId);
              if (path) entries.push({ path });
            }
          }
          if (!entries.length) return new Response("No public sitemap pages", { status: 404 });
          return new Response(sitemapXML(BASE_URL, entries), {
            headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
          });
        } catch {
          return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
        }
      },
    },
  },
});