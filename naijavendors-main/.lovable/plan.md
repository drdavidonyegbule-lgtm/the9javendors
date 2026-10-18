# 9JA Vendors PWA

## What I’ll build
- A polished Nigerian marketplace home experience using the supplied green, gold, dark-green, and light palette.
- Sticky navigation, mobile menu, smart search suggestions, and a full-width rotating showcase for Fashion, Culinary, Professional Services, and Arts.
- Category filters and realistic verified-vendor listings with ratings, locations, contact actions, and vendor detail views.
- Email/password and Google sign-in, backed by Lovable Cloud.
- Installable app metadata plus guarded offline support for the published app.
- Accessible labels, image descriptions, mobile layouts, and complete social-sharing metadata.

## Pages and flows
- Home marketplace at `/` with search, categories, featured vendors, how it works, and contact information.
- Vendor profile pages with catalog items, reviews, phone, and WhatsApp actions.
- Sign-in and registration page.
- Search and category filtering will work immediately with seeded marketplace listings.

## Technical details
- Keep TanStack Start routing and semantic Tailwind design tokens.
- Add public marketplace tables with explicit grants and row-level policies; keep user roles in a dedicated table.
- Use route-specific metadata for every page.
- Use `vite-plugin-pwa` only for published offline caching, with preview/dev registration blocked and `/~oauth` excluded.
- Generate and bundle cohesive Nigerian marketplace photography and app icons rather than using external placeholders.
