import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { json, publicClient } from "@/lib/public-api.server";

const credentials = z.object({ email: z.string().email(), password: z.string().min(1) });
export const Route = createFileRoute("/api/public/auth/login")({
  server: { handlers: { POST: async ({ request }) => {
    const parsed = credentials.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ error: "Invalid email or password" }, 400);
    const { data, error } = await publicClient().auth.signInWithPassword(parsed.data);
    return error || !data.session ? json({ error: "Invalid email or password" }, 401) : json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, token_type: data.session.token_type, expires_in: data.session.expires_in }, 200);
  } } },
});
