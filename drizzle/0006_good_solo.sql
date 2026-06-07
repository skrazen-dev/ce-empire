ALTER TABLE `accounts` ADD `accountType` enum('complete','skrill','neteller','bigpay');--> statement-breakpoint
ALTER TABLE `accounts` ADD `accountStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `accounts` ADD `creditLimit` enum('50k','200k','500k');--> statement-breakpoint
ALTER TABLE `agents` ADD `withdrawAmount` decimal(15,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `agents` ADD `pendingAmount` decimal(15,2) DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `agents` ADD `startDate` timestamp;--> statement-breakpoint
ALTER TABLE `expenses` ADD `expenseDate` timestamp;