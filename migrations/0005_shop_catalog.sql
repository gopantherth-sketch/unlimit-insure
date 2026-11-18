CREATE TABLE `shop_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`product_slug` text NOT NULL,
	`mime` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`data_b64` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_products` (
	`slug` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`photo_id` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shop_variants` (
	`sku` text PRIMARY KEY NOT NULL,
	`product_slug` text NOT NULL,
	`label` text NOT NULL,
	`price_satang` integer,
	`active` integer DEFAULT true NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`product_slug`) REFERENCES `shop_products`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shop_variants_product_idx` ON `shop_variants` (`product_slug`);--> statement-breakpoint
-- The placeholder product that content/shop.ts held until C16, so SKU MF-01 (stock, test orders) keeps resolving.
INSERT OR IGNORE INTO `shop_products` (`slug`, `name`, `summary`, `description`, `published`, `sort`) VALUES ('microfiber-cloth', 'ผ้าไมโครไฟเบอร์ [รอข้อมูล]', '[รอข้อมูล]', '[รอข้อมูล: ขนาด เนื้อผ้า วิธีดูแล]', 0, 0);
--> statement-breakpoint
INSERT OR IGNORE INTO `shop_variants` (`sku`, `product_slug`, `label`, `price_satang`, `active`, `sort`) VALUES ('MF-01', 'microfiber-cloth', '[รอข้อมูล]', NULL, 1, 0);
