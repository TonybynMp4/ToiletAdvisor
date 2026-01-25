ALTER TABLE `user` DROP INDEX `user_email_unique`;--> statement-breakpoint
ALTER TABLE `user` ADD `profile_picture_url` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` DROP COLUMN `email`;