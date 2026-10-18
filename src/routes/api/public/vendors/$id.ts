import { createFileRoute } from "@tanstack/react-router";
import { json, publicClient } from "@/lib/public-api.server";

export const Route = createFileRoute("/api/public/vendors/$id")({
  server: { handlers: {
    GET: async ({ params }) => {
      const client = publicClient();
      const { data: vendor, error } = await client.from("vendors").select("id,slug,business_name,category,location,description,phone,whatsapp,verified_status,image_url,created_at").eq("id", params.id).maybeSingle();
      if (error) return json({ error: "Unable to load vendor" }, 500);
      if (!vendor) return json({ error: "Vendor not found" }, 404);
      const [{ data: products }, { data: reviews }] = await Promise.all([
        client.from("products").select("id,title,price,description,image_url,in_stock").eq("vendor_id", vendor.id),
        client.from("reviews").select("rating,comment,created_at").eq("vendor_id", vendor.id).order("created_at", { ascending: false }),
      ]);
      return json({ vendor, products: products ?? [], reviews: reviews ?? [] });
    },
  } },
});
