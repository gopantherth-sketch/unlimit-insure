ALTER TABLE `shop_products` ADD `photo_ids` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `shop_products` ADD `draft` text;--> statement-breakpoint
-- C18: existing cover photos become the first (only) published photo.
UPDATE `shop_products` SET `photo_ids` = json_array(`photo_id`) WHERE `photo_id` IS NOT NULL;
