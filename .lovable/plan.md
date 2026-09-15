# 9Ja Vendors — Ultra-Lean MVP

Sell first, automate later. Customers browse, pay with Paystack, and staff fulfil orders by phone/WhatsApp.

## Look and feel

Taken from the reference image: deep forest-green backgrounds with a soft emerald glow, near-black panels, crisp white headlines, and a bright mint-green button colour. Clean sans-serif type, generous spacing, rounded corners. Product photos sit on light cards so the goods stand out against the dark shell.

## Customer pages

- **Home** — hero, featured products, category shortcuts, link to Shop.
- **Shop** — grid of available products with image, name, price; filter by category.
- **Product details** — large image, description, price, quantity, Add to cart.
- **Cart** — change quantity, remove items, subtotal, delivery fee, total.
- **Checkout** — name, phone, email, delivery address, delivery instructions; then Pay.
- **Payment / confirmation** — success page with order reference number, plus a clear failure state.
- **Contact**, **Terms and Conditions**, **Privacy Policy**, **Returns Policy**.

Cart lives in the browser; no customer account or login anywhere.

## Delivery fee

Because the real rate is confirmed by phone, checkout charges a standard delivery fee that you set once in Settings (and can change any time). After confirming the actual rate, staff can record the true delivery cost on the order for their own records. If you would rather charge zero at checkout and collect delivery on delivery, set the fee to 0.

## Payment

Paystack is wired end to end: the site starts the payment, Paystack collects the money, and the site then verifies the transaction with Paystack before creating a paid order. Orders that fail verification are never marked paid, and the Paystack reference is stored on every order. Nothing goes live until you add your Paystack keys — until then checkout shows a clear "payment not configured yet" message and everything else is fully usable.

## Emails

On a successful payment: a confirmation with the order reference to the customer, and a new-order alert to nupsyak@gmail.com.

## Staff area (sign-in required)

Staff sign in with email and password; only approved staff accounts can enter.

- **Dashboard** — total orders, new, processing, delivered, total sales.
- **Products** — list, add, edit, delete or hide, mark available/unavailable, upload images, category. Optional internal-only fields: supplier name, supplier phone, supplier cost price (never shown to customers).
- **Orders** — table of paid orders with order number, customer, phone, address, items, quantity, amount paid, Paystack reference, date, status.
- **Order details** — full order plus status change: New Order, Processing, Out for Delivery, Delivered, Cancelled. Delivery-fee note recorded here.
- **Settings** — store contact details, standard delivery fee, alert email.

## Not included (by design)

Customer accounts, order history/tracking, supplier or rider portals, procurement, inventory, refunds, WhatsApp/SMS automation, analytics beyond the five dashboard numbers.

## Technical notes

- Lovable Cloud for database, product image storage, staff auth and email.
- Tables: `products` (public read of available rows only; supplier columns readable by staff only), `orders` + `order_items`, `settings`, `user_roles` with a separate `has_role` check for staff/admin. Row-level security on every table; supplier cost data and order records are never readable by anonymous visitors.
- Paystack initialise and verify run in server functions with the secret key; a `/api/public/paystack/webhook` route with signature verification handles the callback as a backup so a closed browser tab can't lose an order. Order creation is idempotent on the Paystack reference.
- Staff admin pages live under the authenticated route group; every admin server function re-checks the staff role server-side.
- Secrets needed later: Paystack secret key (and public key). I'll request them through the secure form when you're ready.
- Each customer page gets its own title/description for search and link sharing.

## Build order

1. Design system, Cloud setup, database tables and security rules.
2. Customer shop, product pages, cart, checkout, policy pages.
3. Staff sign-in, dashboard, products, orders, settings.
4. Paystack initialise/verify/webhook, confirmation page, emails.
