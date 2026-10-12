-- Phase 3: database-driven menu categories and menu items.
CREATE TABLE `menu_categories` (
  `id` VARCHAR(30) NOT NULL,
  `restaurant_id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(110) NOT NULL,
  `description` VARCHAR(255) NULL,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `menu_categories_restaurant_id_slug_key` (`restaurant_id`, `slug`),
  INDEX `menu_categories_restaurant_id_is_active_sort_order_idx` (`restaurant_id`, `is_active`, `sort_order`),
  PRIMARY KEY (`id`),
  CONSTRAINT `menu_categories_restaurant_id_fkey`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `menu_items` (
  `id` VARCHAR(30) NOT NULL,
  `restaurant_id` VARCHAR(30) NOT NULL,
  `category_id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(160) NOT NULL,
  `description` VARCHAR(500) NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image_url` VARCHAR(600) NULL,
  `is_available` BOOLEAN NOT NULL DEFAULT true,
  `is_featured` BOOLEAN NOT NULL DEFAULT false,
  `sort_order` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  INDEX `menu_items_restaurant_id_is_available_sort_order_idx` (`restaurant_id`, `is_available`, `sort_order`),
  INDEX `menu_items_category_id_is_available_sort_order_idx` (`category_id`, `is_available`, `sort_order`),
  PRIMARY KEY (`id`),
  CONSTRAINT `menu_items_restaurant_id_fkey`
    FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `menu_items_category_id_fkey`
    FOREIGN KEY (`category_id`) REFERENCES `menu_categories` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
