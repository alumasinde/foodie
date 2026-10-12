# Phase 2 — Restaurant configuration and tenant-aware public pages

## Included
- Extended the existing Restaurant profile with configurable tagline, hero title/subtitle, logo and hero image URLs, colors, contacts, address/location label, Google Maps URL, coordinates and optional website URL.
- Existing opening-hours model is displayed from the database.
- Tenant-aware public page at `/r/[slug]` resolves only a published restaurant matching that slug.
- Restaurant theme colors are set from that tenant's database record; no per-restaurant source-code conditionals.
- Tenant-specific page metadata and WhatsApp contact links are generated from the stored profile.
- Added a new migration without editing the original migration.
- Unknown/unpublished slugs return a not-found page.

## Deliberately not included yet
- Admin login or profile editor UI (requires authentication/authorization phase or a separately scoped admin feature).
- Custom domains, subscriptions, orders, menu CRUD or booking workflows.
- No demo restaurant is inserted automatically; business details are not hardcoded or seeded.

## Apply changes
1. Configure `.env` and confirm `DATABASE_URL` points to the intended MySQL database.
2. Run `npm install`, `npm run db:generate`, `npm run db:migrate`, `npm run typecheck`, `npm run lint`, and `npm run build`.
3. Create restaurant records through a trusted database/admin process with `isPublished=true` to test `/r/<slug>`.

The slug is a public tenant resolver, not an authorization mechanism. Future admin APIs must authenticate the user and authorize access to the restaurant before reading or changing private data.
