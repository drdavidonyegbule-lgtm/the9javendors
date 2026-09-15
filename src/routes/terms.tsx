import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — 9Ja Vendors" },
      {
        name: "description",
        content:
          "The terms that apply when you order and pay for goods through the 9Ja Vendors website.",
      },
      { property: "og:title", content: "Terms and Conditions — 9Ja Vendors" },
      {
        property: "og:description",
        content: "The terms that apply when you order goods through 9Ja Vendors.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Terms and Conditions"
      intro="These terms apply to every order placed on the 9Ja Vendors website. By paying for an order you accept them."
      sections={[
        {
          heading: "Orders",
          body: "An order is only accepted once your payment has been confirmed. Until then, nothing is reserved for you. If an item turns out to be unavailable after payment, we will contact you to substitute it or refund that item.",
        },
        {
          heading: "Prices and delivery",
          body: "Prices shown include our sourcing cost. Delivery is charged separately and shown before you pay. Prices can change at any time, but the price you pay is the price shown at checkout.",
        },
        {
          heading: "Payment",
          body: "Payments are processed by Paystack. We never see or store your card details. Keep your payment reference: it is how we identify your order.",
        },
        {
          heading: "Delivery times",
          body: "Because our team sources each item, delivery times vary by product and location. We will contact you on the phone number you provide with an estimate after your order is received.",
        },
        {
          heading: "Your details",
          body: "You are responsible for giving us an accurate phone number and delivery address. We cannot be held responsible for a failed delivery caused by wrong details.",
        },
        {
          heading: "Contact",
          body: "For any question about these terms, contact us using the details on our Contact page.",
        },
      ]}
    />
  ),
});
