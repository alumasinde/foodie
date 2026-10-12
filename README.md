# Restaurant Foundation — Phase 1

A mobile-first Next.js + TypeScript foundation for a multi-restaurant digital menu and booking platform.

## Stack

- Next.js App Router + React + TypeScript
- MySQL
- Prisma ORM and migrations
- Zod environment validation
- Tailwind is intentionally not added in this foundation; the initial design uses a small, centralized CSS system to avoid unnecessary dependencies. Tailwind can be introduced if the next phase benefits from it.

## Requirements

- Node.js 20.9 or newer
- MySQL 8.x (or a compatible supported MySQL release)
- npm

## Setup

1. Extract the project and open its directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a MySQL database and a least-privileged database user. Example SQL (run as a database administrator and change the password):

   ```sql
   CREATE DATABASE restaurant_platform
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;

   CREATE USER 'restaurant_app'@'localhost' IDENTIFIED BY 'replace_with_a_strong_password';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, REFERENCES
     ON restaurant_platform.* TO 'restaurant_app'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. Copy `.env.example` to `.env` and set `DATABASE_URL` with your actual credentials.

5. Generate Prisma Client and create the first migration:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   Give the migration a meaningful name such as `foundation_init` when prompted.

6. Start the app:

   ```bash
   npm run dev
   ```

7. Open http://localhost:3000.

## Useful commands

```bash
npm run dev          # Development server
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run build        # Production build
npm run db:studio    # Browse database tables
npm run db:migrate   # Create/apply a development migration
npm run db:deploy    # Apply committed migrations in production
```

## Database model included

- `Restaurant`: identity, slug, branding, contact information, currency and publication status.
- `RestaurantSetting`: extensible per-restaurant settings stored as key/value records.
- `OpeningHour`: weekly opening schedule.

This is intentionally a Phase 1 schema. Menu, menu item, order, reservation, dining area and user authorization models belong in later feature phases.

## Architecture decisions

- Restaurant-specific details are database records, not conditionals or copied source files.
- Secrets and deployment-specific values belong in `.env`; `.env` is ignored by Git.
- `src/lib/prisma.ts` reuses the Prisma client during local hot reload.
- CSS variables centralize the design tokens. No business identity is baked into database records by a seed script.
- The initial homepage is a design preview only. The sample menu labels and food illustrations are placeholders, not live restaurant data.
- `isPublished` defaults to `false` so a restaurant is not accidentally made public before configuration.

## Important production notes

- Do not commit `.env` or share database credentials.
- Use TLS for production database connections where supported.
- Use a separate database user with least privilege for production.
- Add authentication, authorization, rate limiting and audit logging before exposing management operations.
- Enforce tenant scope on every restaurant-owned query; a URL slug alone is not authorization.
- Back up the MySQL database and test restoration before launch.

## Phase 1 acceptance checklist

- [ ] `npm install` succeeds.
- [ ] MySQL database credentials are configured in `.env`.
- [ ] `npm run db:migrate` creates the foundation tables.
- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Homepage is usable at mobile and desktop widths.
