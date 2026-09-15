import { createFileRoute } from "@tanstack/react-router";

import { PolicyPage } from "@/components/PolicyPage";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns Policy — 9Ja Vendors" },
      {
        name: "description",
        content:
          "When you can return an item bought from 9Ja Vendors, how to report a problem and how refunds work.",
      },
      { property: "og:title", content: "Returns Policy — 9Ja Vendors" },
      {
        property: "og:description",
        content: "When you can return an item bought from 9Ja Vendors and how refunds work.",
      },
    ],
  }),
  component: () => (
    <PolicyPage
      title="Returns Policy"
      intro="We want you to be happy with what you receive. If something is wrong, tell us quickly and we will make it right."
      sections={[
        {
          heading: "Report a problem within 24 hours",
          body: "Contact us within 24 hours of delivery if an item is damaged, faulty, expired or not what you ordered. Please keep the item and its packaging, and send us a photo where possible.",
        },
        {
          heading: "What we will do",
          body: "Depending on the item, we will replace it, source a correct one, or refund that item. We will agree the outcome with you before acting.",
        },
        {
          heading: "Items we cannot take back",
          body: "Perishable food that has been opened or stored badly, and items damaged after delivery through misuse, cannot be returned.",
        },
        {
          heading: "Refunds",
          body: "Approved refunds are sent back to the account you paid from. Depending on your bank, it can take a few working days to appear.",
        },
        {
          heading: "Cancellations",
          body: "If you cancel before we have sourced your items, we refund in full. Once sourcing or dispatch has started, we may deduct costs already incurred.",
        },
        {
          heading: "How to reach us",
          body: "Use the phone number, WhatsApp or email on our Contact page and quote your order number or payment reference.",
        },
      ]}
    />
  ),
});
