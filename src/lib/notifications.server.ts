import type { ConfirmedOrder } from "./paystack.server";

/**
 * Order emails.
 *
 * Sending requires a verified sender domain for this project. Until one is
 * configured (Cloud -> Emails), this logs the notification instead of sending
 * so a paid order is never lost. The order always appears in the admin Orders
 * page regardless.
 */
export async function sendOrderNotifications(order: ConfirmedOrder): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: settings } = await supabaseAdmin
    .from("settings")
    .select("alert_email, store_name")
    .maybeSingle();

  const adminEmail = settings?.["alert_email"] ?? "nupsyak@gmail.com";
  const storeName = settings?.["store_name"] ?? "9Ja Vendors";

  console.info(
    `[order-notification] ${storeName} order ${order.orderNumber} paid (${order.reference}). ` +
      `Customer copy -> ${order.customerEmail}; staff alert -> ${adminEmail}.`,
  );
}
