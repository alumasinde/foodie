# Foodie RBAC and timestamp defaults

## Normalized access-control tables

- `roles`: restaurant-scoped role definitions (`owner`, `manager`, `menu_editor`, `order_staff`).
- `permissions`: global permission catalogue.
- `role_permissions`: many-to-many mapping between roles and permissions.
- `user_roles`: restaurant-scoped user membership and assigned role. One user can have one role per restaurant; a user can belong to multiple restaurants.

The migration converts existing JSON role permission arrays into `role_permissions` rows before dropping the old `roles.permissions` column. Existing user memberships and role IDs are preserved.

## Seed data

Run `npm run db:seed` after applying migrations. The seed is safe to re-run: it upserts permission catalogue entries and the four standard roles for every restaurant, then synchronizes each role's permission grants. It intentionally does not create a fake user or default password. Create the first owner through the guarded `/api/admin/bootstrap` endpoint; that endpoint assigns the Owner role in `user_roles`.

## Timestamps

Every table now has `created_at` and `updated_at`. `updated_at` has a database default of `CURRENT_TIMESTAMP(3)`, so a manual insert does not need to supply the column. Prisma models use `@default(now()) @updatedAt`; Prisma updates the field automatically on writes through Prisma. For direct SQL updates, explicitly set `updated_at = CURRENT_TIMESTAMP(3)` if you need the value to change, since Prisma's `@updatedAt` behavior is client-side.

## Apply

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run typecheck
npm run lint
npm run build
```

Do not reset the database. This migration preserves existing restaurants, roles, users, memberships, orders, reservations, and menu records.
