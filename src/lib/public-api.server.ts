import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const vendorInput = z.object({
  business_name: z.string().trim().min(2).max(120),
  category: z.enum(["Fashion & Textiles", "Culinary & Groceries", "Professional Services", "Beauty & Wellness", "Real Estate", "Arts & Craft"]),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(3000),
  phone: z.string().trim().min(5).max(30),
  whatsapp: z.string().trim().min(5).max(30),
});

export function publicClient(token?: string) {
  const url = process.env['SUPABASE_URL'] ?? import.meta.env['VITE_SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error("Marketplace connection unavailable");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}) });
}

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export function bearer(request: Request) {
  const value = request.headers.get("authorization");
  return value?.startsWith("Bearer ") ? value.slice(7) : null;
}
