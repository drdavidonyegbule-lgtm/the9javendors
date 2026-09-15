const PAYSTACK_BASE = "https://api.paystack.co";

export type CartLine = { productId: string; quantity: number };

export type OrderMetadata = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  subtotal: number;
  deliveryFee: number;
  items: { productId: string; productName: string; unitPrice: number; quantity: number }[];
};

export function getPaystackSecretKey(): string | null {
  const key = process.env["PAYSTACK_SECRET_KEY"];
  return key && key.trim().length > 0 ? key.trim() : null;
}

export async function initializeTransaction(input: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackUrl: string;
  metadata: OrderMetadata;
}): Promise<{ authorizationUrl: string }> {
  const secret = getPaystackSecretKey();
  if (!secret) throw new Error("Paystack is not configured");

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountNaira * 100),
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { order: input.metadata },
    }),
  });

  const payload = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };

  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    console.error("Paystack initialize failed", payload.message);
    throw new Error("Could not start the payment. Please try again.");
  }

  return { authorizationUrl: payload.data.authorization_url };
}

export type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  metadata?: { order?: OrderMetadata };
};

export async function verifyTransaction(reference: string): Promise<PaystackTransaction | null> {
  const secret = getPaystackSecretKey();
  if (!secret) throw new Error("Paystack is not configured");

  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );

  const payload = (await response.json()) as {
    status?: boolean;
    data?: PaystackTransaction;
  };

  if (!response.ok || !payload.status || !payload.data) return null;
  return payload.data;
}

export type ConfirmedOrder = {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  reference: string;
  createdAt: string;
  items: { productName: string; quantity: number; unitPrice: number }[];
  deliveryFee: number;
  subtotal: number;
};

/**
 * Creates the paid order from a verified Paystack transaction.
 * Idempotent on the payment reference, so the browser callback and the
 * webhook can both run safely.
 */
export async function recordPaidOrder(
  transaction: PaystackTransaction,
): Promise<ConfirmedOrder | null> {
  if (transaction.status !== "success") return null;
  const meta = transaction.metadata?.order;
  if (!meta) {
    console.error("Paystack transaction has no order metadata", transaction.reference);
    return null;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("orders")
    .select("id, order_number, customer_name, customer_email, total, subtotal, delivery_fee, payment_reference, created_at")
    .eq("payment_reference", transaction.reference)
    .maybeSingle();

  if (existing) {
    const { data: items } = await supabaseAdmin
      .from("order_items")
      .select("product_name, quantity, unit_price")
      .eq("order_id", existing["id"]);

    return {
      orderNumber: existing["order_number"],
      customerName: existing["customer_name"],
      customerEmail: existing["customer_email"],
      total: Number(existing["total"]),
      subtotal: Number(existing["subtotal"]),
      deliveryFee: Number(existing["delivery_fee"]),
      reference: existing["payment_reference"],
      createdAt: existing["created_at"],
      items: (items ?? []).map((item) => ({
        productName: item["product_name"],
        quantity: item["quantity"],
        unitPrice: Number(item["unit_price"]),
      })),
    };
  }

  const total = transaction.amount / 100;

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .insert({
      customer_name: meta.customerName,
      customer_phone: meta.customerPhone,
      customer_email: meta.customerEmail,
      delivery_address: meta.deliveryAddress,
      delivery_instructions: meta.deliveryInstructions,
      subtotal: meta.subtotal,
      delivery_fee: meta.deliveryFee,
      total,
      payment_reference: transaction.reference,
      payment_status: "paid",
      status: "new",
    })
    .select("id, order_number, created_at")
    .single();

  if (error || !order) {
    console.error("Could not store paid order", error?.message);
    return null;
  }

  const { error: itemsError } = await supabaseAdmin.from("order_items").insert(
    meta.items.map((item) => ({
      order_id: order["id"],
      product_id: item.productId,
      product_name: item.productName,
      unit_price: item.unitPrice,
      quantity: item.quantity,
    })),
  );
  if (itemsError) console.error("Could not store order items", itemsError.message);

  const confirmed: ConfirmedOrder = {
    orderNumber: order["order_number"],
    customerName: meta.customerName,
    customerEmail: meta.customerEmail,
    total,
    subtotal: meta.subtotal,
    deliveryFee: meta.deliveryFee,
    reference: transaction.reference,
    createdAt: order["created_at"],
    items: meta.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  };

  const { sendOrderNotifications } = await import("./notifications.server");
  await sendOrderNotifications(confirmed);

  return confirmed;
}
