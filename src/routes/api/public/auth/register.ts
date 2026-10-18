import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { json, publicClient } from "@/lib/public-api.server";

const credentials = z.object({ email: z.string().email(), password: z.string().min(6).max(128) });
export const Route = createFileRoute("/api/public/auth/register")({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => {
    const parsed = credentials.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid email or password" }, 400);
    const { error } = await publicClient().auth.signUp(parsed.data);
    return error ? json({ error: error.message }, 400) : json({ message: "Check your email to confirm your account." }, 201);
  } } },
});
