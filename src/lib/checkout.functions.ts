import { createServerFn } from "@tanstack/react-start";

export type CheckoutInput = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryInstructions: string;
  origin: string;
  items: { productId: string; quantity: number }[];
};

export type CheckoutResult =
  | { ok: true; authorizationUrl: string }
  | { ok: false; reason: "not_configured" | "invalid" | "empty_cart" | "failed"; message: string };

function clean(value: unknown, max: number): string {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export const startCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => ({
    customerName: clean(data.customerName, 120),
    customerPhone: clean(data.customerPhone, 30),
    customerEmail: clean(data.customerEmail, 200).toLowerCase(),
    deliveryAddress: clean(data.deliveryAddress, 500),
    deliveryInstructions: clean(data.deliveryInstructions, 500),
    origin: clean(data.origin, 300),
    items: (Array.isArray(data.items) ? data.items : []).slice(0, 40).map((item) => ({
      productId: clean(item.productId, 60),
      quantity: Math.min(Math.max(Math.trunc(Number(item.quantity) || 1), 1), 50),
    })),
  }))
  .handler(async ({ data }): Promise<CheckoutResult> => {
    const { getPaystackSecretKey, initializeTransaction } = await import("./paystack.server");
    const { createPublicClient, PUBLIC_SETTINGS_COLUMNS } = await import(
      "./supabase-public.server"
    );

    if (data.items.length === 0) {
      return { ok: false, reason: "empty_cart", message: "Your cart is empty." };
    }
    if (
      !data.customerName ||
      !data.customerPhone ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.customerEmail) ||
      data.deliveryAddress.length < 8
    ) {
      return {
        ok: false,
        reason: "invalid",
        message: "Please check your name, phone number, email and delivery address.",
      };
    }
    if (!getPaystackSecretKey()) {
      return {
        ok: false,
        reason: "not_configured",
        message:
          "Online payment is not switched on yet. Please call us to place this order and we will take payment directly.",
      };
    }

    let originUrl: URL;
    try {
      originUrl = new URL(data.origin);
    } catch {
      return { ok: false, reason: "invalid", message: "Could not start the payment." };
    }

    const supabase = createPublicClient();

    const { data: rows, error } = await supabase
      .from("products")
      .select("id, name, price, is_available, is_hidden")
      .in(
        "id",
        data.items.map((item) => item.productId),
      );

    if (error) {
      console.error("startCheckout product lookup failed", error.message);
      return { ok: false, reason: "failed", message: "Could not start the payment." };
    }

    const priced = data.items
      .map((item) => {
        const row = (rows ?? []).find((candidate) => candidate["id"] === item.productId);
        if (!row || row["is_hidden"] || !row["is_available"]) return null;
        return {
          productId: item.productId,
          productName: row["name"] as string,
          unitPrice: Number(row["price"]),
          quantity: item.quantity,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    if (priced.length === 0) {
      return {
        ok: false,
        reason: "empty_cart",
        message: "The items in your cart are no longer available.",
      };
    }

    const { data: settings } = await supabase
      .from("settings")
      .select(PUBLIC_SETTINGS_COLUMNS)
      .maybeSingle();

    const deliveryFee = Number(settings?.["delivery_fee"] ?? 0);
    const subtotal = priced.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const total = subtotal + deliveryFee;

    const reference = `9JV-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    try {
      const { authorizationUrl } = await initializeTransaction({
        email: data.customerEmail,
        amountNaira: total,
        reference,
        callbackUrl: `${originUrl.origin}/order-confirmation`,
        metadata: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail,
          deliveryAddress: data.deliveryAddress,
          deliveryInstructions: data.deliveryInstructions,
          subtotal,
          deliveryFee,
          items: priced,
        },
      });
      return { ok: true, authorizationUrl };
    } catch (paymentError) {
      console.error("startCheckout failed", paymentError);
      return { ok: false, reason: "failed", message: "Could not start the payment." };
    }
  });

export type ConfirmationResult =
  | {
      ok: true;
      orderNumber: string;
      total: number;
      subtotal: number;
      deliveryFee: number;
      customerName: string;
      reference: string;
      items: { productName: string; quantity: number; unitPrice: number }[];
    }
  | { ok: false; message: string };

export const confirmPayment = createServerFn({ method: "POST" })
  .inputValidator((data: { reference: string }) => ({
    reference: clean(data.reference, 120),
  }))
  .handler(async ({ data }): Promise<ConfirmationResult> => {
    const { verifyTransaction, recordPaidOrder, getPaystackSecretKey } = await import(
      "./paystack.server"
    );

    if (!data.reference) return { ok: false, message: "No payment reference was provided." };
    if (!getPaystackSecretKey()) {
      return { ok: false, message: "Online payment is not switched on yet." };
    }

    const transaction = await verifyTransaction(data.reference);
    if (!transaction || transaction.status !== "success") {
      return {
        ok: false,
        message: "This payment was not completed. You have not been charged for an order.",
      };
    }

    const order = await recordPaidOrder(transaction);
    if (!order) {
      return {
        ok: false,
        message:
          "Your payment went through but we could not finish the order. Please contact us with your payment reference.",
      };
    }

    return {
      ok: true,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      customerName: order.customerName,
      reference: order.reference,
      items: order.items,
    };
  });
