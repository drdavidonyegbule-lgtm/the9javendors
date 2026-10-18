import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { bearer, json, publicClient, vendorInput } from "@/lib/public-api.server";

const querySchema = z.object({ category: z.string().max(100).optional(), location: z.string().max(100).optional(), search: z.string().max(100).optional() });

export const Route = createFileRoute("/api/public/vendors/")({
  staticData: { sitemap: false },
  server: { handlers: {
    GET: async ({ request }) => {
      const params = new URL(request.url).searchParams;
      const parsed = querySchema.safeParse({ category: params.get("category") ?? undefined, location: params.get("location") ?? undefined, search: params.get("search") ?? undefined });
      if (!parsed.success) return json({ error: "Invalid filters" }, 400);
      let query = publicClient().from("vendors").select("id,slug,business_name,category,location,description,phone,whatsapp,verified_status,image_url,created_at").order("created_at", { ascending: false }).limit(100);
      if (parsed.data.category) query = query.eq("category", parsed.data.category);
      if (parsed.data.location) query = query.ilike("location", `%${parsed.data.location.replace(/[%_,().]/g, "")}%`);
      if (parsed.data.search) {
        const term = parsed.data.search.replace(/[%_,().]/g, "");
        query = query.or(`business_name.ilike.%${term}%,description.ilike.%${term}%,location.ilike.%${term}%`);
      }
      const { data, error } = await query;
      return error ? json({ error: "Unable to load vendors" }, 500) : json({ vendors: data });
    },
    POST: async ({ request }) => {
      const token = bearer(request);
      if (!token) return json({ error: "Sign in required" }, 401);
      const client = publicClient(token);
      const { data: { user }, error: authError } = await client.auth.getUser(token);
      if (authError || !user) return json({ error: "Sign in required" }, 401);
      const payload = await request.json().catch(() => null);
      const parsed = vendorInput.safeParse(payload);
      if (!parsed.success) return json({ error: "Invalid business details", details: parsed.error.flatten().fieldErrors }, 400);
      const base = parsed.data.business_name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "business";
      const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
      const { data, error } = await client.from("vendors").insert({ ...parsed.data, user_id: user.id, slug }).select("id,slug").single();
      return error ? json({ error: "Unable to create business listing" }, 400) : json({ vendor: data }, 201);
    },
  } },
});
