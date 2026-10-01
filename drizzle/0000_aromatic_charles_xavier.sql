CREATE TABLE `business_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `business_types_name_unique` ON `business_types` (`name`);--> statement-breakpoint
CREATE TABLE `lender_programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`snapshot_id` integer NOT NULL,
	`lender_id` integer NOT NULL,
	`program_type_id` integer NOT NULL,
	`min_amount` integer NOT NULL,
	`max_amount` integer NOT NULL,
	`min_credit` integer NOT NULL,
	`credit_tier` text NOT NULL,
	`min_years` integer NOT NULL,
	`rate_min` real NOT NULL,
	`rate_max` real NOT NULL,
	`max_term_months` integer NOT NULL,
	`sba_pct` integer NOT NULL,
	`business_type_id` integer,
	`collateral` text NOT NULL,
	`max_debt_ratio` real,
	`turnaround_days` integer NOT NULL,
	`special_requirement_id` integer,
	`last_updated` text NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `snapshots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lender_id`) REFERENCES `lenders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_type_id`) REFERENCES `program_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`business_type_id`) REFERENCES `business_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`special_requirement_id`) REFERENCES `special_requirements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lenders` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lenders_name_unique` ON `lenders` (`name`);--> statement-breakpoint
CREATE TABLE `program_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`blurb` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `program_types_name_unique` ON `program_types` (`name`);--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_file` text NOT NULL,
	`file_hash` text NOT NULL,
	`imported_at` text NOT NULL,
	`row_count` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `snapshots_file_hash_unique` ON `snapshots` (`file_hash`);--> statement-breakpoint
CREATE TABLE `special_requirements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`rule_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `special_requirements_text_unique` ON `special_requirements` (`text`);