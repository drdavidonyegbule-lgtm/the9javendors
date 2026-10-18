<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public marketplace discovery uses seeded example listings plus live Lovable Cloud vendor records, so the experience is useful before organic listings arrive.
- Offline support uses vite-plugin-pwa with one guarded registrar that never runs in development or Lovable previews, preventing stale preview caches.

- Sitemap URLs derive from required route-level staticData.sitemap decisions; public dynamic products use their existing visibility rules and paginated anonymous reads, so private pages and hidden products stay excluded.
