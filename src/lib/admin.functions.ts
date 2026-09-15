import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  imagePath: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isHidden: boolean;
  supplierName: string;
  supplierPhone: string;
  supplierCost: number | null;
};

export type AdminOrderItem = { productName: string; quantity: number; unitPrice: number };

export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentReference: string;
  status: string;
  confirmedDeliveryCost: number | null;
  staffNotes: string;
  createdAt: string;
  items: AdminOrderItem[];
};

export type AdminSettings = {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeWhatsapp: string;
  storeAddress: string;
  deliveryFee: number;
  alertEmail: string;
};

export const ORDER_STATUSES = [
  { value: "new", label: "New Order" },
  { value: "processing", label: "Processing" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
] as const;

const STATUS_VALUES = ORDER_STATUSES.map((status) => status.value) as readonly string[];

type StaffContext = {
  supabase: {
    rpc: (
      fn: "is_staff",
      args: { _user_id: string },
    ) => PromiseLike<{ data: unknown }>;
  };
};

async function assertStaff(context: StaffContext, userId: string): Promise<void> {
  const { data } = await context.supabase.rpc("is_staff", { _user_id: userId });
  if (data !== true) throw new Error("Forbidden");
}

function text(value: unknown, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `product-${Date.now().toString(36)}`
  );
}

export const getStaffStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ isStaff: boolean; email: string | null }> => {
    const { data } = await context.supabase.rpc("is_staff", { _user_id: context.userId });
    const email = (context.claims as { email?: string } | null)?.email ?? null;
    return { isStaff: data === true, email };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminProduct[]> => {
    await assertStaff(context, context.userId);

    const { data, error } = await context.supabase
      .from("products")
      .select(
        "id, name, slug, description, price, category, image_url, image_path, is_available, is_hidden, product_supplier_info(supplier_name, supplier_phone, supplier_cost)",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => {
      const supplierRaw = row["product_supplier_info"];
      const supplier = (Array.isArray(supplierRaw) ? supplierRaw[0] : supplierRaw) ?? null;
      return {
        id: row["id"],
        name: row["name"],
        slug: row["slug"],
        description: row["description"] ?? "",
        price: Number(row["price"]),
        category: row["category"],
        imagePath: row["image_path"] ?? null,
        imageUrl: row["image_url"] ?? null,
        isAvailable: row["is_available"],
        isHidden: row["is_hidden"],
        supplierName: supplier?.["supplier_name"] ?? "",
        supplierPhone: supplier?.["supplier_phone"] ?? "",
        supplierCost:
          supplier?.["supplier_cost"] === null || supplier?.["supplier_cost"] === undefined
            ? null
            : Number(supplier["supplier_cost"]),
      };
    });
  });

export type SaveProductInput = {
  id?: string | null;
  name: string;
  description: string;
  price: number;
  category: string;
  imagePath?: string | null;
  imageUrl?: string | null;
  isAvailable: boolean;
  isHidden: boolean;
  supplierName?: string;
  supplierPhone?: string;
  supplierCost?: number | null;
};

export const adminSaveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SaveProductInput) => ({
    id: data.id ? text(data.id, 60) : null,
    name: text(data.name, 140),
    description: text(data.description, 4000),
    price: Math.max(0, Number(data.price) || 0),
    category: text(data.category, 60) || "General",
    imagePath: data.imagePath ? text(data.imagePath, 400) : null,
    imageUrl: data.imageUrl ? text(data.imageUrl, 600) : null,
    isAvailable: Boolean(data.isAvailable),
    isHidden: Boolean(data.isHidden),
    supplierName: text(data.supplierName, 140),
    supplierPhone: text(data.supplierPhone, 40),
    supplierCost:
      data.supplierCost === null || data.supplierCost === undefined || data.supplierCost === ("" as unknown)
        ? null
        : Math.max(0, Number(data.supplierCost) || 0),
  }))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    await assertStaff(context, context.userId);
    if (!data.name) throw new Error("A product name is required.");

    const payload = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image_path: data.imagePath,
      image_url: data.imageUrl,
      is_available: data.isAvailable,
      is_hidden: data.isHidden,
    };

    let productId = data.id;

    if (productId) {
      const { error } = await context.supabase
        .from("products")
        .update(payload)
        .eq("id", productId);
      if (error) throw new Error(error.message);
    } else {
      const { data: inserted, error } = await context.supabase
        .from("products")
        .insert({ ...payload, slug: `${slugify(data.name)}-${Date.now().toString(36).slice(-4)}` })
        .select("id")
        .single();
      if (error || !inserted) throw new Error(error?.message ?? "Could not save the product.");
      productId = inserted["id"];
    }

    const hasSupplierInfo = data.supplierName || data.supplierPhone || data.supplierCost !== null;
    if (hasSupplierInfo) {
      const { error } = await context.supabase.from("product_supplier_info").upsert({
        product_id: productId,
        supplier_name: data.supplierName || null,
        supplier_phone: data.supplierPhone || null,
        supplier_cost: data.supplierCost,
      });
      if (error) throw new Error(error.message);
    } else {
      await context.supabase.from("product_supplier_info").delete().eq("product_id", productId);
    }

    return { id: productId! };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: text(data.id, 60) }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertStaff(context, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const ORDER_COLUMNS =
  "id, order_number, customer_name, customer_phone, customer_email, delivery_address, delivery_instructions, subtotal, delivery_fee, total, payment_reference, status, confirmed_delivery_cost, staff_notes, created_at, order_items(product_name, quantity, unit_price)";

function mapOrder(row: Record<string, any>): AdminOrder {
  return {
    id: row["id"],
    orderNumber: row["order_number"],
    customerName: row["customer_name"],
    customerPhone: row["customer_phone"],
    customerEmail: row["customer_email"],
    deliveryAddress: row["delivery_address"],
    deliveryInstructions: row["delivery_instructions"] ?? "",
    subtotal: Number(row["subtotal"]),
    deliveryFee: Number(row["delivery_fee"]),
    total: Number(row["total"]),
    paymentReference: row["payment_reference"],
    status: row["status"],
    confirmedDeliveryCost:
      row["confirmed_delivery_cost"] === null ? null : Number(row["confirmed_delivery_cost"]),
    staffNotes: row["staff_notes"] ?? "",
    createdAt: row["created_at"],
    items: (row["order_items"] ?? []).map((item: Record<string, any>) => ({
      productName: item["product_name"],
      quantity: item["quantity"],
      unitPrice: Number(item["unit_price"]),
    })),
  };
}

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminOrder[]> => {
    await assertStaff(context, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapOrder);
  });

export const adminGetOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: text(data.id, 60) }))
  .handler(async ({ data, context }): Promise<AdminOrder | null> => {
    await assertStaff(context, context.userId);
    const { data: row, error } = await context.supabase
      .from("orders")
      .select(ORDER_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ? mapOrder(row) : null;
  });

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      id: string;
      status?: string;
      staffNotes?: string;
      confirmedDeliveryCost?: number | null;
    }) => ({
      id: text(data.id, 60),
      status: data.status && STATUS_VALUES.includes(data.status) ? data.status : undefined,
      staffNotes: data.staffNotes === undefined ? undefined : text(data.staffNotes, 2000),
      confirmedDeliveryCost:
        data.confirmedDeliveryCost === undefined
          ? undefined
          : data.confirmedDeliveryCost === null
            ? null
            : Math.max(0, Number(data.confirmedDeliveryCost) || 0),
    }),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertStaff(context, context.userId);
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) patch["status"] = data.status;
    if (data.staffNotes !== undefined) patch["staff_notes"] = data.staffNotes;
    if (data.confirmedDeliveryCost !== undefined)
      patch["confirmed_delivery_cost"] = data.confirmedDeliveryCost;

    if (Object.keys(patch).length === 0) return { ok: true };

    const { error } = await context.supabase.from("orders").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminGetStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(
    async ({
      context,
    }): Promise<{
      totalOrders: number;
      newOrders: number;
      processingOrders: number;
      deliveredOrders: number;
      totalSales: number;
    }> => {
      await assertStaff(context, context.userId);
      const { data, error } = await context.supabase.from("orders").select("status, total");
      if (error) throw new Error(error.message);

      const rows = data ?? [];
      return {
        totalOrders: rows.length,
        newOrders: rows.filter((row) => row["status"] === "new").length,
        processingOrders: rows.filter((row) =>
          ["processing", "out_for_delivery"].includes(row["status"]),
        ).length,
        deliveredOrders: rows.filter((row) => row["status"] === "delivered").length,
        totalSales: rows
          .filter((row) => row["status"] !== "cancelled")
          .reduce((sum, row) => sum + Number(row["total"]), 0),
      };
    },
  );

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminSettings> => {
    await assertStaff(context, context.userId);
    const { data } = await context.supabase.from("settings").select("*").maybeSingle();
    return {
      storeName: data?.["store_name"] ?? "9Ja Vendors",
      storePhone: data?.["store_phone"] ?? "",
      storeEmail: data?.["store_email"] ?? "",
      storeWhatsapp: data?.["store_whatsapp"] ?? "",
      storeAddress: data?.["store_address"] ?? "",
      deliveryFee: Number(data?.["delivery_fee"] ?? 0),
      alertEmail: data?.["alert_email"] ?? "",
    };
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: AdminSettings) => ({
    storeName: text(data.storeName, 120) || "9Ja Vendors",
    storePhone: text(data.storePhone, 40),
    storeEmail: text(data.storeEmail, 200),
    storeWhatsapp: text(data.storeWhatsapp, 40),
    storeAddress: text(data.storeAddress, 300),
    deliveryFee: Math.max(0, Number(data.deliveryFee) || 0),
    alertEmail: text(data.alertEmail, 200),
  }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertStaff(context, context.userId);
    const { error } = await context.supabase
      .from("settings")
      .update({
        store_name: data.storeName,
        store_phone: data.storePhone,
        store_email: data.storeEmail,
        store_whatsapp: data.storeWhatsapp,
        store_address: data.storeAddress,
        delivery_fee: data.deliveryFee,
        alert_email: data.alertEmail,
      })
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
