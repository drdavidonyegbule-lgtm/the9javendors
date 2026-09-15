import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { buttonPrimary, inputBase, labelBase } from "@/components/ui-classes";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff sign in — 9Ja Vendors" },
      { name: "description", content: "Sign in to the 9Ja Vendors staff area." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Staff sign in — 9Ja Vendors" },
      { property: "og:description", content: "Sign in to the 9Ja Vendors staff area." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        navigate({ to: "/admin" });
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      if (data.session) {
        navigate({ to: "/admin" });
        return;
      }
      setMessage("Check your email to confirm this account, then sign in.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-glow">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-sm font-black text-primary-foreground">
          9J
        </span>
        <h1 className="mt-5 text-2xl font-extrabold">
          {mode === "signin" ? "Staff sign in" : "Create a staff account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for the 9Ja Vendors team only.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <div>
            <label className={labelBase} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputBase}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="mt-5">
            <label className={labelBase} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              className={inputBase}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
          </div>

          {error ? (
            <p className="mt-5 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-sm">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-5 rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
              {message}
            </p>
          ) : null}

          <button type="submit" disabled={busy} className={`${buttonPrimary} mt-6 w-full`}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="mt-5 text-sm text-muted-foreground underline hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
