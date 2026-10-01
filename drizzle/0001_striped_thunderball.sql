CREATE TABLE `recommendation_programs` (
	`recommendation_id` integer NOT NULL,
	`lender_program_id` integer NOT NULL,
	PRIMARY KEY(`recommendation_id`, `lender_program_id`),
	FOREIGN KEY (`recommendation_id`) REFERENCES `recommendations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`lender_program_id`) REFERENCES `lender_programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recommendations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`kind` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`sent_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`password` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
INSERT INTO `users` (`username`, `name`, `role`, `password`, `created_at`) VALUES
	('sdr1', 'Priya SDR 1', 'sdr', 'sdr1', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr2', 'Diego SDR 2', 'sdr', 'sdr2', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr3', 'Hannah SDR 3', 'sdr', 'sdr3', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr4', 'Jamal SDR 4', 'sdr', 'sdr4', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr5', 'Elena SDR 5', 'sdr', 'sdr5', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr6', 'Wei SDR 6', 'sdr', 'sdr6', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr7', 'Sofia SDR 7', 'sdr', 'sdr7', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('sdr8', 'Marcus SDR 8', 'sdr', 'sdr8', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('manager1', 'Sales Manager 1', 'manager', 'manager1', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
	('manager2', 'Sales Manager 2', 'manager', 'manager2', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
