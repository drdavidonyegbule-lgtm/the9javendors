async function unregisterAppWorker() {
  if (!("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.filter((registration) => new URL(registration.scope).origin === window.location.origin).map((registration) => registration.unregister()));
}

export async function registerPwa() {
  if (!("serviceWorker" in navigator)) return;
  const host = window.location.hostname;
  const blocked = !import.meta.env.PROD || window.self !== window.top || host.startsWith("id-preview--") || host.startsWith("preview--") || host === "lovableproject.com" || host.endsWith(".lovableproject.com") || host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com") || host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev") || new URLSearchParams(window.location.search).has("sw");
  if (blocked) { await unregisterAppWorker(); return; }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}