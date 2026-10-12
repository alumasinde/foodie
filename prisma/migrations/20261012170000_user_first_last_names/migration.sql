-- Split existing user names while moving to explicit first_name / last_name columns.
ALTER TABLE `users`
  ADD COLUMN `first_name` VARCHAR(70) NOT NULL DEFAULT '',
  ADD COLUMN `last_name` VARCHAR(70) NOT NULL DEFAULT '';

UPDATE `users`
SET
  `first_name` = LEFT(TRIM(SUBSTRING_INDEX(TRIM(`full_name`), ' ', 1)), 70),
  `last_name` = LEFT(TRIM(CASE
    WHEN LOCATE(' ', TRIM(`full_name`)) > 0
      THEN SUBSTRING(TRIM(`full_name`), LOCATE(' ', TRIM(`full_name`)) + 1)
    ELSE ''
  END), 70);

ALTER TABLE `users` DROP COLUMN `full_name`;
