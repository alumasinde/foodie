# Phase 5 — Restaurant admin dashboard

## Included
- Signed, expiring, HttpOnly/SameSite=Strict admin session cookie; password hashes use Node.js scrypt.
- Restaurant-scoped users and memberships, roles and explicit permission lists.
- Initial owner bootstrap endpoint; bootstrap is disabled without `ADMIN_BOOTSTRAP_KEY` and closes after the first user exists.
- Built-in roles: Owner, Manager, Menu editor, Order & booking staff.
- Permission checks are enforced in API handlers, not only in the UI.
- Dashboard overview; menu item create/edit and availability/featured flags; category create/edit/delete; order and reservation status management; opening hours; restaurant homepage content and branding; team user creation, role assignment and access deactivation.
- Image fields accept public image URLs. File upload/storage is intentionally not included; configure object storage before supporting uploads.

## First owner setup
1. Configure `SESSION_SECRET` and a temporary `ADMIN_BOOTSTRAP_KEY` in `.env`.
2. Ensure the restaurant exists in `restaurants` and note its exact `slug`.
3. Apply migrations and generate Prisma client.
4. Send a one-time POST to `/api/admin/bootstrap` with JSON: `{ "setupKey": "...", "restaurantSlug": "...", "first_name": "...", "last_name": "...", "email": "...", "password": "at-least-12-characters" }`.
5. Sign in at `/admin/login`, verify owner access, then remove `ADMIN_BOOTSTRAP_KEY` from the environment and restart the app.

## Permission keys
- `menu:read`, `menu:write`, `categories:write`
- `orders:read`, `orders:write`
- `reservations:read`, `reservations:write`
- `settings:write`, `hours:write`, `users:manage`

## Important deployment notes
- Use HTTPS in production; session cookies become Secure in production.
- Configure a strong random `SESSION_SECRET` and never commit `.env`.
- Add edge/server rate limiting to login and bootstrap before public deployment; use a shared store if running multiple instances.
- Configure managed image storage/CDN for photo uploads; this phase stores public image URLs only.
- Do not expose bootstrap credentials publicly; the bootstrap endpoint is guarded by a long one-time secret and a no-existing-users check.
