ALTER TABLE `accounts` ADD `profilePhotoUrl` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `idCardNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `accounts` ADD `idCardPhotoUrl` text;--> statement-breakpoint
ALTER TABLE `accounts` ADD `dateOfBirth` timestamp;--> statement-breakpoint
ALTER TABLE `accounts` ADD `virtualCardNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `accounts` ADD `cardCVV` varchar(10);--> statement-breakpoint
ALTER TABLE `accounts` ADD `cardExpiryDate` varchar(10);--> statement-breakpoint
ALTER TABLE `accounts` ADD `accountEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `accounts` ADD `accountPassword` varchar(255);