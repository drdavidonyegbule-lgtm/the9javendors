import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Send, X, Compass } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "./ui/button";

const tourSteps = [
  { sel: '[data-tour="nav"]', title: "Welcome to 9JA Vendors!", text: "Use the menu to browse Categories, learn How it works, read the FAQ or contact us." },
  { sel: '[data-tour="search"]', title: "Find vendors fast", text: "Search by vendor name, category or city like Lagos, Abuja or Port Harcourt." },
  { sel: '[data-tour="auth"]', title: "Sign in or register", text: "Create an account with email or with your Google (Gmail) account to list your business." },
  { sel: '[data-tour="theme"]', title: "Light or dark", text: "Switch between light and dark mode any time." },
  { sel: '[data-tour="chat"]', title: "I'm Ada, your assistant", text: "Tap here any time to ask questions or get help finding your way." },
];

function Tour({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(tourSteps[i]!.sel));
    const el = els.find((e) => e.offsetParent !== null) ?? null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    const t = setTimeout(() => setRect(el ? el.getBoundingClientRect() : null), 350);
    return () => clearTimeout(t);
  }, [i]);
  const step = tourSteps[i]!;
  const last = i === tourSteps.length - 1;
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label="Site tour">
      <div className="absolute inset-0 bg-foreground/40" onClick={onDone} />
      {rect && <div className="pointer-events-none absolute rounded-lg ring-4 ring-accent transition-all" style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} />}
      <div className="absolute inset-x-4 bottom-24 mx-auto max-w-sm rounded-lg border border-border bg-card p-5 text-card-foreground shadow-card">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Tour {i + 1} of {tourSteps.length}</p>
        <h2 className="mt-2 text-lg font-bold">{step.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
        <div className="mt-4 flex justify-between">
          <Button variant="ghost" onClick={onDone}>Skip</Button>
          <div className="flex gap-2">
            {i > 0 && <Button variant="outline" onClick={() => setI(i - 1)}>Back</Button>}
            <Button onClick={() => (last ? onDone() : setI(i + 1))}>{last ? "Finish" : "Next"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [touring, setTouring] = useState(false);
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, error } = useChat({ transport: new DefaultChatTransport({ api: "/api/chat" }) });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    try { if (!localStorage.getItem("toured")) { const t = setTimeout(() => setTouring(true), 800); return () => clearTimeout(t); } } catch { /* ignore */ }
    return undefined;
  }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages, status]);
  useEffect(() => { if (open && !busy) inputRef.current?.focus(); }, [open, busy]);

  function endTour() { setTouring(false); try { localStorage.setItem("toured", "1"); } catch { /* ignore */ } setOpen(true); }
  function send(text: string) { const t = text.trim(); if (!t || busy) return; setInput(""); void sendMessage({ text: t }); }

  return (
    <>
      {touring && <Tour onDone={endTour} />}
      {open && (
        <div className="fixed bottom-24 right-4 z-[60] flex h-[min(560px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-card">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-accent font-bold text-accent-foreground">A</span><div><p className="text-sm font-bold">Ada · 9JA Vendors</p><p className="text-xs opacity-80">Ask me anything</p></div></div>
            <div className="flex">
              <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" aria-label="Start site tour" onClick={() => { setOpen(false); setTouring(true); }}><Compass /></Button>
              <Button size="icon" variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground" aria-label="Close chat" onClick={() => setOpen(false)}><X /></Button>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {messages.length === 0 && (
              <div>
                <p>Hi! I'm Ada 👋 I can answer questions and help you find your way around.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["How do I contact a vendor?", "How do I list my business?", "Sign up with Google", "Take me to categories"].map((s) => (
                    <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-3 py-1 text-xs hover:border-primary hover:text-primary">{s}</button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "ml-8 rounded-lg bg-primary px-3 py-2 text-primary-foreground" : "mr-4"}>
                {m.parts.map((p, idx) => p.type === "text" ? (
                  <div key={idx} className="space-y-2 [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown components={{ a: ({ href, children }) => <a href={href} onClick={(e) => { if (href?.startsWith("/")) { e.preventDefault(); void navigate({ to: href }); } }}>{children}</a> }}>{p.text}</ReactMarkdown>
                  </div>
                ) : null)}
              </div>
            ))}
            {status === "submitted" && <p className="text-muted-foreground">Ada is typing…</p>}
            {error && <p role="alert" className="text-destructive">Sorry, I couldn't answer right now. Please try again shortly.</p>}
            <div ref={endRef} />
          </div>
          <form className="flex items-end gap-2 border-t border-border p-3" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }} placeholder="Type your question…" aria-label="Message" className="max-h-28 min-h-10 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send"><Send /></Button>
          </form>
        </div>
      )}
      <Button data-tour="chat" onClick={() => setOpen(!open)} aria-label={open ? "Close assistant" : "Open assistant"} className="fixed bottom-5 right-4 z-[60] size-14 rounded-full shadow-brand">
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>
    </>
  );
}
