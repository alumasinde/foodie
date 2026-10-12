# Foodie — Restaurant Website Platform

Mobile-first multi-restaurant website foundation built with Next.js App Router, TypeScript, MySQL and Prisma.

## Requirements
- Node.js 20.9+
- MySQL 8+
- npm

## Install
1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Install dependencies: `npm install` (this corrected archive intentionally excludes the stale lockfile from the previous mismatched install; commit the newly generated `package-lock.json` after reviewing it).
3. If npm blocks dependency install scripts, inspect `npm install-scripts ls` and approve only the expected Prisma packages: `@prisma/client`, `prisma`, and `@prisma/engines`.
4. Generate Prisma Client: `npm run db:generate`
5. Apply migrations: `npm run db:migrate` (development) or `npm run db:deploy` (production)
6. Run checks: `npm run typecheck`, `npm run lint`, `npm run build`
7. Start locally: `npm run dev`

## Tenant-aware public websites
Published restaurant profile pages are served at `/r/<slug>`. The slug is looked up from MySQL and only published records are returned. Branding and profile fields are loaded per restaurant; the application does not contain restaurant-specific details or business codes.

Phase 2 profile fields include name, slug, description, tagline, logo URL, hero image URL, hero title/subtitle, theme colors, phone, WhatsApp number, email, address, location label, Google Maps URL, optional coordinates, optional website URL, currency, timezone, and opening hours.

## Migrations
A new Phase 2 migration extends `restaurants`. Existing migration history is preserved. Do not edit already-applied migrations; use new migrations for future schema changes.

## Environment
`DATABASE_URL` is a secret and belongs in `.env`/deployment secret settings. Do not commit `.env`. Public restaurant profile values belong in MySQL; database credentials and app secrets do not.

## Security boundaries
- A restaurant slug selects a public profile only; it is not proof of admin authorization.
- Admin CRUD endpoints and authenticated owner access are not part of Phase 2.
- Keep `isPublished=false` until a profile is ready to be public.
- Validate image/URL inputs in the future admin form before saving.
- Back up MySQL and test restore before production.

## Useful scripts
- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:deploy`
- `npm run db:studio`
