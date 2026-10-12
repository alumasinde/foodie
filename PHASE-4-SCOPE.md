# Phase 4 — Ordering and table reservations

## Included
- Tenant-scoped cart and checkout on each published restaurant page.
- Server-side validation and authoritative pricing from the selected restaurant's available menu items.
- Pickup, delivery and dine-in order requests; delivery address required for delivery.
- Order reference generated on submission and a public reference-based order status lookup.
- WhatsApp follow-up assisted ordering/reservation confirmation when the restaurant has a configured WhatsApp number.
- Table reservation requests with guest count, date/time, optional dining-area choice and special requests.
- Dining areas are tenant-specific and support name, description, capacity, active/inactive and display order.
- All new order/reservation data persists in MySQL. No online payment integration is included.

## Migration
Run `npm run db:generate` and `npm run db:migrate`. This adds `dining_areas`, `customer_orders`, `customer_order_items`, and `table_reservations`; it does not reset existing restaurant or menu data.

## Dining area setup
Create active `DiningArea` records for each restaurant using Prisma Studio for now. Use the restaurant's ID, a clear display name (for example, Patio or Main dining room), optional capacity and description, and set `isActive` to true. An admin UI for managing these records belongs in the admin-dashboard phase.

## Operational notes
- New orders start at `received`; reservation requests start at `requested`.
- Status changes are intended for authorized staff tooling in the admin phase. The public status endpoint is read-only and requires the generated reference.
- Customers are told the request is not confirmed until the restaurant contacts them. No payment is collected and delivery charges are not calculated.
- The order API rechecks restaurant ownership and item availability on the server and calculates prices from the database; browser-submitted prices are never trusted.
