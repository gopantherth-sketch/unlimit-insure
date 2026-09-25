CREATE TABLE `event_counts` (
	`day` text NOT NULL,
	`name` text NOT NULL,
	`dim` text DEFAULT '' NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`day`, `name`, `dim`)
);
