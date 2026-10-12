-- Normalize restaurant RBAC while preserving existing roles, memberships and grants.
RENAME TABLE `restaurant_roles` TO `roles`;
RENAME TABLE `restaurant_memberships` TO `user_roles`;

-- Align legacy constraint and index names with the normalized table names in Prisma.
ALTER TABLE `roles` DROP FOREIGN KEY `restaurant_roles_restaurant_id_fkey`;
ALTER TABLE `roles` DROP INDEX `restaurant_roles_restaurant_id_key_key`;
ALTER TABLE `roles` DROP INDEX `restaurant_roles_restaurant_id_idx`;
ALTER TABLE `roles` ADD UNIQUE INDEX `roles_restaurant_id_key_key` (`restaurant_id`, `key`);
ALTER TABLE `roles` ADD INDEX `roles_restaurant_id_idx` (`restaurant_id`);
ALTER TABLE `roles` ADD CONSTRAINT `roles_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_roles` DROP FOREIGN KEY `restaurant_memberships_restaurant_id_fkey`;
ALTER TABLE `user_roles` DROP FOREIGN KEY `restaurant_memberships_user_id_fkey`;
ALTER TABLE `user_roles` DROP FOREIGN KEY `restaurant_memberships_role_id_fkey`;
ALTER TABLE `user_roles` DROP INDEX `restaurant_memberships_restaurant_id_user_id_key`;
ALTER TABLE `user_roles` DROP INDEX `restaurant_memberships_user_id_is_active_idx`;
ALTER TABLE `user_roles` DROP INDEX `restaurant_memberships_restaurant_id_role_id_idx`;
ALTER TABLE `user_roles` ADD UNIQUE INDEX `user_roles_restaurant_id_user_id_key` (`restaurant_id`, `user_id`);
ALTER TABLE `user_roles` ADD INDEX `user_roles_user_id_is_active_idx` (`user_id`, `is_active`);
ALTER TABLE `user_roles` ADD INDEX `user_roles_restaurant_id_role_id_idx` (`restaurant_id`, `role_id`);
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `permissions` (
  `key` VARCHAR(80) NOT NULL,
  `name` VARCHAR(120) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `role_permissions` (
  `role_id` VARCHAR(30) NOT NULL,
  `permission_key` VARCHAR(80) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`role_id`, `permission_key`),
  INDEX `role_permissions_permission_key_idx` (`permission_key`),
  CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `role_permissions_permission_key_fkey` FOREIGN KEY (`permission_key`) REFERENCES `permissions` (`key`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `permissions` (`key`, `name`, `description`) VALUES
('menu:read','View menu','View menu items and categories'),
('menu:write','Manage menu','Create and edit menu items'),
('categories:write','Manage categories','Create and edit menu categories'),
('orders:read','View orders','View customer orders'),
('orders:write','Manage orders','Update order status'),
('reservations:read','View reservations','View table bookings'),
('reservations:write','Manage reservations','Confirm or decline bookings'),
('settings:write','Manage website','Edit restaurant profile and homepage'),
('hours:write','Manage opening hours','Edit opening hours'),
('users:manage','Manage team','Create team accounts and assign roles');

-- Existing permissions are stored as JSON arrays in roles.permissions. Migrate them before dropping the old column.
INSERT INTO `role_permissions` (`role_id`, `permission_key`)
SELECT r.`id`, p.`key`
FROM `roles` r
JOIN `permissions` p ON JSON_CONTAINS(CAST(r.`permissions` AS JSON), JSON_QUOTE(p.`key`));

ALTER TABLE `roles` DROP COLUMN `permissions`;

-- Give updated_at a database default so manual SQL inserts and other tools can omit it.
ALTER TABLE `restaurants` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `restaurant_settings` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `menu_categories` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `menu_items` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `dining_areas` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `customer_orders` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `table_reservations` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `users` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `roles` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `user_roles` MODIFY `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

ALTER TABLE `opening_hours` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `customer_order_items` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `role_permissions` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
