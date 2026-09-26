import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/refunds")({
  beforeLoad: () => {
    throw redirect({ to: "/returns" });
  },
});
