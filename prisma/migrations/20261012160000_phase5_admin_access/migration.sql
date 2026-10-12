CREATE TABLE `users` (
  `id` VARCHAR(30) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `full_name` VARCHAR(140) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `last_login_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key` (`email`),
  INDEX `users_is_active_idx` (`is_active`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `restaurant_roles` (
  `id` VARCHAR(30) NOT NULL,
  `restaurant_id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(80) NOT NULL,
  `key` VARCHAR(60) NOT NULL,
  `permissions` TEXT NOT NULL,
  `is_system` BOOLEAN NOT NULL DEFAULT false,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `restaurant_roles_restaurant_id_key_key` (`restaurant_id`, `key`),
  INDEX `restaurant_roles_restaurant_id_idx` (`restaurant_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `restaurant_roles_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `restaurant_memberships` (
  `id` VARCHAR(30) NOT NULL,
  `restaurant_id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `role_id` VARCHAR(30) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `restaurant_memberships_restaurant_id_user_id_key` (`restaurant_id`, `user_id`),
  INDEX `restaurant_memberships_user_id_is_active_idx` (`user_id`, `is_active`),
  INDEX `restaurant_memberships_restaurant_id_role_id_idx` (`restaurant_id`, `role_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `restaurant_memberships_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `restaurant_memberships_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `restaurant_memberships_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `restaurant_roles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
