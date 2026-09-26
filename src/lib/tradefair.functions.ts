import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { VENDOR_CATEGORIES } from "./directory.functions";

const vendorSchema = z.object({
  ownerName: z.string().trim().min(2).max(120),
  businessName: z.string().trim().min(2).max(140),
  category: z.enum(VENDOR_CATEGORIES),
  phone: z.string().trim().min(7).max(30).regex(/^[+()\-\s0-9]+$/),
  storefrontUrl: z.union([z.literal(""), z.string().url().max(500)]).default(""),
});
const saleSchema = z.object({
  vendorId: z.string().uuid(),
  amount: z.number().positive().max(100000000),
  paymentReference: z.string().trim().min(3).max(120).regex(/^[A-Za-z0-9._-]+$/),
});

type Vendor = { id: string; vendorCode: string; ownerName: string; businessName: string; category: string; phone: string; storefrontUrl: string | null; isVerified: boolean; isListed: boolean; transactionVolume: number; createdAt: string };
type EventSale = { id: string; vendorId: string; businessName: string; amount: number; commissionAmount: number; paymentReference: string; paymentStatus: string; createdAt: string };

type StaffContext = { supabase: { rpc: (fn: "is_staff", args: { _user_id: string }) => PromiseLike<{ data: unknown }> }; userId: string };
async function assertStaff(context: StaffContext) {
  const { data } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
  if (data !== true) throw new Error("You do not have staff access.");
}

function mapVendor(row: any): Vendor {
  return { id: row.id, vendorCode: row.vendor_code, ownerName: row.owner_name, businessName: row.business_name, category: row.category, phone: row.phone, storefrontUrl: row.storefront_url, isVerified: row.is_verified, isListed: row.is_listed, transactionVolume: Number(row.transaction_volume), createdAt: row.created_at };
}

export const adminListVendors = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<Vendor[]> => {
  await assertStaff(context);
  const { data, error } = await context.supabase.from("vendors").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapVendor);
});

export const onboardVendor = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => vendorSchema.parse(data)).handler(async ({ data, context }): Promise<Vendor> => {
  await assertStaff(context);
  const { data: row, error } = await context.supabase.from("vendors").insert({ owner_name: data.ownerName, business_name: data.businessName, category: data.category, phone: data.phone, storefront_url: data.storefrontUrl || null }).select("*").single();
  if (error || !row) throw new Error(error?.message ?? "Could not register the vendor.");
  return mapVendor(row);
});

export const updateVendorDirectoryStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ id: z.string().uuid(), isVerified: z.boolean(), isListed: z.boolean() }).parse(data)).handler(async ({ data, context }) => {
  await assertStaff(context);
  const { error } = await context.supabase.from("vendors").update({ is_verified: data.isVerified, is_listed: data.isListed }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return { ok: true as const };
});

export const recordEventSale = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => saleSchema.parse(data)).handler(async ({ data, context }) => {
  await assertStaff(context);
  const { data: settings } = await context.supabase.from("settings").select("event_commission_rate").eq("id", true).maybeSingle();
  const rate = Math.min(1, Math.max(0, Number(settings?.event_commission_rate ?? 0.05)));
  const { data: row, error } = await context.supabase.from("event_sales").insert({ vendor_id: data.vendorId, amount: data.amount, commission_rate: rate, payment_reference: data.paymentReference, payment_status: "paid" }).select("id, commission_amount").single();
  if (error || !row) throw new Error(error?.message ?? "Could not record the sale.");
  return { id: row.id, commissionAmount: Number(row.commission_amount) };
});

export const adminListEventSales = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<EventSale[]> => {
  await assertStaff(context);
  const { data, error } = await context.supabase.from("event_sales").select("id, vendor_id, amount, commission_amount, payment_reference, payment_status, created_at, vendors(business_name)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({ id: row.id, vendorId: row.vendor_id, businessName: Array.isArray(row.vendors) ? row.vendors[0]?.business_name ?? "Vendor" : row.vendors?.business_name ?? "Vendor", amount: Number(row.amount), commissionAmount: Number(row.commission_amount), paymentReference: row.payment_reference, paymentStatus: row.payment_status, createdAt: row.created_at }));
});

export const adminGetPlatformStats = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertStaff(context);
  const [{ data: vendors, error: vendorError }, { data: sales, error: salesError }] = await Promise.all([
    context.supabase.from("vendors").select("id"),
    context.supabase.from("event_sales").select("amount, commission_amount, payment_status"),
  ]);
  if (vendorError || salesError) throw new Error(vendorError?.message ?? salesError?.message ?? "Could not load platform totals.");
  const paid = (sales ?? []).filter((sale) => sale.payment_status === "paid");
  return { onboardedVendors: vendors?.length ?? 0, fairGrossVolume: paid.reduce((sum, sale) => sum + Number(sale.amount), 0), platformCommission: paid.reduce((sum, sale) => sum + Number(sale.commission_amount), 0) };
});
