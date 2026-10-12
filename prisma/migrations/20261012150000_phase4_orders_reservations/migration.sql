CREATE TABLE `dining_areas` (
  `id` VARCHAR(30) NOT NULL, `restaurant_id` VARCHAR(30) NOT NULL, `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL, `capacity` SMALLINT UNSIGNED NULL, `is_active` BOOLEAN NOT NULL DEFAULT true,
  `sort_order` INTEGER NOT NULL DEFAULT 0, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, PRIMARY KEY (`id`), UNIQUE INDEX `dining_areas_restaurant_id_name_key` (`restaurant_id`,`name`),
  INDEX `dining_areas_restaurant_id_is_active_sort_order_idx` (`restaurant_id`,`is_active`,`sort_order`),
  CONSTRAINT `dining_areas_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `customer_orders` (
  `id` VARCHAR(30) NOT NULL, `reference` VARCHAR(20) NOT NULL, `restaurant_id` VARCHAR(30) NOT NULL,
  `customer_name` VARCHAR(120) NOT NULL, `customer_phone` VARCHAR(30) NOT NULL, `order_type` VARCHAR(20) NOT NULL,
  `delivery_address` VARCHAR(500) NULL, `notes` VARCHAR(500) NULL, `status` VARCHAR(30) NOT NULL DEFAULT 'received',
  `subtotal` DECIMAL(10,2) NOT NULL, `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, PRIMARY KEY (`id`), UNIQUE INDEX `customer_orders_reference_key` (`reference`),
  INDEX `customer_orders_restaurant_id_status_created_at_idx` (`restaurant_id`,`status`,`created_at`),
  INDEX `customer_orders_customer_phone_created_at_idx` (`customer_phone`,`created_at`),
  CONSTRAINT `customer_orders_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `customer_order_items` (
  `id` VARCHAR(30) NOT NULL, `order_id` VARCHAR(30) NOT NULL, `menu_item_id` VARCHAR(30) NOT NULL,
  `item_name` VARCHAR(160) NOT NULL, `unit_price` DECIMAL(10,2) NOT NULL, `quantity` SMALLINT UNSIGNED NOT NULL,
  `line_total` DECIMAL(10,2) NOT NULL, PRIMARY KEY (`id`), INDEX `customer_order_items_order_id_idx` (`order_id`),
  CONSTRAINT `customer_order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `customer_orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `customer_order_items_menu_item_id_fkey` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `table_reservations` (
  `id` VARCHAR(30) NOT NULL, `reference` VARCHAR(20) NOT NULL, `restaurant_id` VARCHAR(30) NOT NULL,
  `dining_area_id` VARCHAR(30) NULL, `customer_name` VARCHAR(120) NOT NULL, `customer_phone` VARCHAR(30) NOT NULL,
  `guest_count` SMALLINT UNSIGNED NOT NULL, `reservation_date` DATETIME(0) NOT NULL, `notes` VARCHAR(500) NULL,
  `status` VARCHAR(30) NOT NULL DEFAULT 'requested', `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL, PRIMARY KEY (`id`), UNIQUE INDEX `table_reservations_reference_key` (`reference`),
  INDEX `table_reservations_restaurant_id_reservation_date_status_idx` (`restaurant_id`,`reservation_date`,`status`),
  INDEX `table_reservations_customer_phone_created_at_idx` (`customer_phone`,`created_at`),
  CONSTRAINT `table_reservations_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `table_reservations_dining_area_id_fkey` FOREIGN KEY (`dining_area_id`) REFERENCES `dining_areas` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
