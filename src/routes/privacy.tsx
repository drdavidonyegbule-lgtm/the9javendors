import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — 9Ja Vendors" },
      {
        name: "description",
        content:
          "How 9Ja Vendors collects and uses the name, phone number, email and address you give us when ordering.",
      },
      { property: "og:title", content: "Privacy Policy — 9Ja Vendors" },
      {
        property: "og:description",
        content: "How 9Ja Vendors collects and uses the details you give us when ordering.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Privacy Policy"
      intro="We only collect what we need to deliver your order. This page explains what that is and how we use it."
      sections={[
        {
          heading: "What we collect",
          body: "Your name, phone number, email address, delivery address and any delivery instructions you give us at checkout, plus the payment reference returned by Paystack.",
        },
        {
          heading: "Why we collect it",
          body: "To confirm your payment, source your items, arrange delivery and contact you about your order.",
        },
        {
          heading: "Card details",
          body: "We never collect or store card details. Payments are handled entirely by Paystack on their own secure pages.",
        },
        {
          heading: "Who we share it with",
          body: "Only the people needed to fulfil your order, such as the dispatch rider delivering to you. We do not sell your details or use them for unrelated marketing.",
        },
        {
          heading: "How long we keep it",
          body: "We keep order records for as long as we need them for accounting and customer support purposes.",
        },
        {
          heading: "Your choices",
          body: "You can ask us to correct or delete your details by contacting us, unless we are required to keep them for accounting reasons.",
        },
      ]}
    />
  ),
});
