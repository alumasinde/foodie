# Foodie migration recovery

## Why this patch exists

The historical migration `20261012130958_update_users_to_use_first_last_name` ran before `users` was created in `20261012160000_phase5_admin_access`. That made a fresh shadow database fail with P3006/P3018. The actual conversion is already performed by `20261012170000_user_first_last_names`; the earlier migration is now a no-op for clean migration replay.

## Existing database recovery

Do not reset the database. After copying the patch into the project, run `npx prisma migrate status`, then `npm run db:deploy`. This applies pending migration `20261012180000_normalized_roles_permissions_updated_at`, which adds `opening_hours.updated_at` and the other timestamp defaults/columns.

Use `npm run db:deploy` for this recovery instead of `npm run db:migrate`, because `migrate dev` creates a shadow database and replays the broken historical sequence. Once history is reconciled and verified, normal development migrations can resume.

If `db:deploy` reports that the historical migration was modified or reports a checksum issue, stop and do not reset or edit `_prisma_migrations` manually. Share the exact output so the applied migration history can be reconciled safely.
