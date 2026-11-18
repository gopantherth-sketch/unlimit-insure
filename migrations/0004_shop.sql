CREATE TABLE `shop_order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`sku` text NOT NULL,
	`label` text NOT NULL,
	`qty` integer NOT NULL,
	`unit_satang` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `shop_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `shop_order_items_order_idx` ON `shop_order_items` (`order_id`);--> statement-breakpoint
CREATE TABLE `shop_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`number` text NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`items_satang` integer NOT NULL,
	`shipping_satang` integer DEFAULT 0 NOT NULL,
	`total_satang` integer NOT NULL,
	`line_name` text NOT NULL,
	`courier` text,
	`tracking` text,
	`note` text,
	`stock_taken` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shop_orders_number_unique` ON `shop_orders` (`number`);--> statement-breakpoint
CREATE INDEX `shop_orders_status_idx` ON `shop_orders` (`status`);--> statement-breakpoint
CREATE INDEX `shop_orders_created_idx` ON `shop_orders` (`created_at`);--> statement-breakpoint
CREATE TABLE `shop_stock` (
	`sku` text PRIMARY KEY NOT NULL,
	`qty` integer NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
