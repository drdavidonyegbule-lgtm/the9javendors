import { createFileRoute } from "@tanstack/react-router";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { faqs, siteMap } from "@/lib/faq-data";

const system = `You are "Ada", the friendly customer assistant for 9JA Vendors, a marketplace of Nigerian businesses.
Answer briefly (under 120 words), warmly, in plain English. Help users with FAQ questions and navigating the site.
When pointing to a page, use a markdown link with the path, e.g. [Categories](/categories).
Never invent vendors, prices, phone numbers or policies. If unsure, suggest the [Contact](/contact) page.

FAQ:
${faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n")}

Pages:
${siteMap.map((p) => `${p.path} — ${p.label}`).join("\n")}`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages: UIMessage[] };
        if (!Array.isArray(messages) || messages.length > 60) return new Response("Bad request", { status: 400 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("Assistant is not configured", { status: 500 });
        const openai = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
        });
        const result = streamText({
          model: openai.responses("openai/gpt-6-astra"),
          system,
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: {
            openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] },
          },
        });
        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
