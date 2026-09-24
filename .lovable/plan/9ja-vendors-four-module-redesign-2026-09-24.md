# 9Ja Vendors four-module redesign

## Goal
Turn the current direct store into one cohesive platform with four working areas: event vendor onboarding and sales, a public merchant directory, the existing consumer store, and a protected operator workspace. Preserve working products, cart, checkout, orders, and staff authentication.

## Visual direction
- Replace the dark emerald/glow style with a Nigerian market direction built around flag green, white, quiet paper, and strong ink.
- Add restrained Nigerian and wider African visual character through textile-inspired linework, market-sign typography hierarchy, bold color blocking, and documentary product/vendor imagery. Avoid stereotyped motifs and decorative clutter.
- Use the system font stack, tighter square-to-small radii, clear section boundaries, and minimal shadows.
- Remove gradients, glow effects, decorative pills, generic feature-card rows, unsupported claims, and marketing filler.
- Make the first page an operational gateway into the marketplace, store, and event workflow, using real products and merchant records only.
- Use responsive top navigation on public pages and a compact workspace navigation for staff.

## Four modules

### 1. Trade Fair Terminal
- Add a staff-protected event terminal.
- Register a vendor using full name, business name, category, and phone number.
- Generate a stable human-readable vendor ID.
- Record an on-site cash-free sale with amount, payment reference, and configurable platform commission.
- Show the newly registered vendor and recorded sale immediately.

### 2. Merchant Marketplace
- Add a public vendor directory with category filters.
- Show only vendors staff mark as public and verified.
- Display business name, category, vendor ID, storefront link when supplied, and real completed transaction volume.
- Do not show private phone numbers, owner names, invented ratings, or fabricated trust signals.

### 3. Direct Consumer Store
- Keep the current product catalogue, product pages, cart, checkout, Paystack flow, and order confirmation.
- Restyle every customer page to the new design system.
- Keep checkout fields limited to fulfilment needs and add clear consent/context around payment and delivery data.
- Keep existing order repricing and payment verification protections.

### 4. Operator Workspace
- Extend the current protected admin area with Vendors and Event Sales.
- Update the dashboard to show real marketplace and event metrics alongside direct-store orders.
- Keep products, orders, and settings functional.
- Add vendor visibility/verification controls and event-sale records without adding broader role complexity.

## Data and security
- Add `vendors` and `event_sales` tables with indexes, explicit grants, row-level security, and staff-only write access.
- Public access is limited to a safe vendor projection through a dedicated database function; private contact details remain unavailable publicly.
- Event sales are staff-only. Totals shown publicly are aggregated from real records.
- Validate and cap all server inputs. Require staff authentication and server-side role checks for every mutation.
- Preserve CSRF protection and the existing server-auth boundary.
- Run the database security linter after migration and resolve actionable findings.

## Legal, privacy, and accessibility
- Keep real Privacy, Terms, and Returns pages, relabel policy text as a draft where legal details remain unconfirmed, and add missing social metadata.
- Treat the existing Returns page as the required refunds route in navigation, while also making `/refunds` resolve to it for compatibility.
- Do not add a cookie banner because the app currently has no non-essential cookie use; document that decision in the Privacy page.
- Document Paystack and the externally hosted font removal. Use system fonts to avoid the Google Fonts request.
- Add meaningful image alternatives, explicit labels, visible focus states, skip navigation, keyboard-safe menus, status announcements, and accessible tables/forms.
- Do not invent a legal entity, physical address, ratings, licenses, transaction figures, or compliance badges. Mark jurisdiction/legal-review gaps clearly.

## Installability
- Add a standards-based web app manifest and app icons so the platform can be added to a device home screen.
- Do not add offline caching or a service worker because the requested workflows depend on live product, payment, and order data; stale transactional screens would be unsafe.

## Technical delivery
- Add the database migration first, then typed server functions, then routes and navigation.
- Rework shared styles and controls once so public and staff pages remain consistent.
- Add unique page metadata for every new page and complete missing Open Graph fields on existing content routes.
- Verify desktop and mobile views, keyboard focus, public filtering, protected staff workflows, current shop/cart behavior, and final build health.

## Human confirmation still needed
- Legal business name, registered address, governing jurisdiction, and counsel review of policy drafts.
- Whether vendor ratings will ever be collected; none will be shown now.
- Paystack credentials and a verified email sender remain required for live payment and notification testing.
