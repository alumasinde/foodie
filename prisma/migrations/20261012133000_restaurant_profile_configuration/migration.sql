-- Phase 2: database-driven restaurant profile, hero and location configuration.
ALTER TABLE `restaurants`
  ADD COLUMN `tagline` VARCHAR(180) NULL,
  ADD COLUMN `hero_title` VARCHAR(180) NULL,
  ADD COLUMN `hero_subtitle` TEXT NULL,
  ADD COLUMN `location_name` VARCHAR(180) NULL,
  ADD COLUMN `google_maps_url` VARCHAR(600) NULL,
  ADD COLUMN `latitude` DECIMAL(10,7) NULL,
  ADD COLUMN `longitude` DECIMAL(10,7) NULL,
  ADD COLUMN `website_url` VARCHAR(500) NULL;
