CREATE TABLE `deposit_slips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accountId` int,
	`slipImageUrl` text NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`slipDate` timestamp NOT NULL,
	`description` text,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deposit_slips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profit_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profitThb` decimal(15,2) NOT NULL,
	`profitPercent` decimal(8,4) NOT NULL,
	`source` varchar(100) NOT NULL,
	`description` text,
	`recordDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profit_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usdt_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`usdtAmount` decimal(15,4) NOT NULL,
	`thbRate` decimal(8,2) NOT NULL,
	`thbEquivalent` decimal(15,2) NOT NULL,
	`description` text,
	`uploadDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usdt_uploads_id` PRIMARY KEY(`id`)
);
