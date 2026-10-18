import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/refunds")({
  staticData: { sitemap: false },
  beforeLoad: () => {
    throw redirect({ to: "/returns" });
  },
});
