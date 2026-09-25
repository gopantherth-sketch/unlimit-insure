CREATE TABLE `consents` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`purpose` text NOT NULL,
	`granted` integer NOT NULL,
	`wording` text NOT NULL,
	`wording_version` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `consents_lead_idx` ON `consents` (`lead_id`);--> statement-breakpoint
CREATE TABLE `insurers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`accent` text NOT NULL,
	`claims_hotline` text,
	`logo_key` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lead_activities` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`type` text NOT NULL,
	`note` text,
	`actor` text NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `lead_activities_lead_idx` ON `lead_activities` (`lead_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`line_id` text,
	`preferred_channel` text NOT NULL,
	`question` text,
	`status` text DEFAULT 'new' NOT NULL,
	`context` text NOT NULL,
	`assigned_to` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_reference_unique` ON `leads` (`reference`);--> statement-breakpoint
CREATE INDEX `leads_status_idx` ON `leads` (`status`);--> statement-breakpoint
CREATE INDEX `leads_created_idx` ON `leads` (`created_at`);--> statement-breakpoint
CREATE TABLE `product_versions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`version` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`effective_from` text NOT NULL,
	`effective_until` text NOT NULL,
	`coverage` text NOT NULL,
	`pricing` text NOT NULL,
	`eligibility` text NOT NULL,
	`benefits` text NOT NULL,
	`suitable_for` text NOT NULL,
	`source_status` text DEFAULT 'pending' NOT NULL,
	`source_document_id` text,
	`source_document_name` text NOT NULL,
	`source_page` integer,
	`source_note` text,
	`verified_by` text,
	`verified_at` text,
	`published_at` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_document_id`) REFERENCES `source_documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_versions_product_version_uq` ON `product_versions` (`product_id`,`version`);--> statement-breakpoint
CREATE INDEX `product_versions_status_idx` ON `product_versions` (`status`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`insurer_id` text NOT NULL,
	`name` text NOT NULL,
	`summary` text NOT NULL,
	`insurance_type` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`insurer_id`) REFERENCES `insurers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quote_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text,
	`product_version_id` text NOT NULL,
	`vehicle` text NOT NULL,
	`premium` integer NOT NULL,
	`sum_insured` integer NOT NULL,
	`coverage` text NOT NULL,
	`benefits` text NOT NULL,
	`source` text NOT NULL,
	`captured_by` text NOT NULL,
	`captured_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_version_id`) REFERENCES `product_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `source_documents` (
	`id` text PRIMARY KEY NOT NULL,
	`insurer_id` text,
	`name` text NOT NULL,
	`storage_key` text,
	`note` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	FOREIGN KEY (`insurer_id`) REFERENCES `insurers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vehicle_brands` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_th` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicle_models` (
	`id` text PRIMARY KEY NOT NULL,
	`brand_id` text NOT NULL,
	`name` text NOT NULL,
	`body_type` text NOT NULL,
	`powertrain` text NOT NULL,
	`new_price` integer NOT NULL,
	`year_from` integer NOT NULL,
	`year_to` integer NOT NULL,
	FOREIGN KEY (`brand_id`) REFERENCES `vehicle_brands`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `vehicle_models_brand_idx` ON `vehicle_models` (`brand_id`);