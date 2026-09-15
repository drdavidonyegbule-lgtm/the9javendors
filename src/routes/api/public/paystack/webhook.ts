import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/paystack/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["PAYSTACK_SECRET_KEY"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const body = await request.text();
        const signature = request.headers.get("x-paystack-signature") ?? "";
        const expected = createHmac("sha512", secret).update(body).digest("hex");

        const received = Buffer.from(signature);
        const computed = Buffer.from(expected);
        if (received.length !== computed.length || !timingSafeEqual(received, computed)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: { event?: string; data?: { reference?: string } };
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        if (event.event === "charge.success" && event.data?.reference) {
          const { verifyTransaction, recordPaidOrder } = await import("@/lib/paystack.server");
          const transaction = await verifyTransaction(event.data.reference);
          if (transaction) await recordPaidOrder(transaction);
        }

        return new Response("ok");
      },
    },
  },
});
