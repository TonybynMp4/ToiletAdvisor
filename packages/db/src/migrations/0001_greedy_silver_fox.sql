CREATE TABLE `post_media` (
	`id` varchar(128) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`postId` varchar(128) NOT NULL,
	`userId` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `post_media` ADD CONSTRAINT `post_media_postId_post_id_fk` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_media` ADD CONSTRAINT `post_media_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;