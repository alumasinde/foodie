-- CreateTable
CREATE TABLE `restaurants` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `logo_url` VARCHAR(500) NULL,
    `hero_image_url` VARCHAR(500) NULL,
    `primary_color` CHAR(7) NOT NULL DEFAULT '#078C99',
    `accent_color` CHAR(7) NOT NULL DEFAULT '#FFB72B',
    `phone` VARCHAR(30) NULL,
    `whatsapp_number` VARCHAR(30) NULL,
    `email` VARCHAR(190) NULL,
    `address` VARCHAR(255) NULL,
    `currency` CHAR(3) NOT NULL DEFAULT 'KES',
    `timezone` VARCHAR(80) NOT NULL DEFAULT 'Africa/Nairobi',
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `restaurants_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `restaurant_settings` (
    `id` VARCHAR(30) NOT NULL,
    `restaurant_id` VARCHAR(30) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `restaurant_settings_restaurant_id_idx`(`restaurant_id`),
    UNIQUE INDEX `restaurant_settings_restaurant_id_key_key`(`restaurant_id`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_hours` (
    `id` VARCHAR(30) NOT NULL,
    `restaurant_id` VARCHAR(30) NOT NULL,
    `day_of_week` TINYINT UNSIGNED NOT NULL,
    `opens_at` CHAR(5) NULL,
    `closes_at` CHAR(5) NULL,
    `is_closed` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `opening_hours_restaurant_id_idx`(`restaurant_id`),
    UNIQUE INDEX `opening_hours_restaurant_id_day_of_week_key`(`restaurant_id`, `day_of_week`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `restaurant_settings` ADD CONSTRAINT `restaurant_settings_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `opening_hours` ADD CONSTRAINT `opening_hours_restaurant_id_fkey` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
