CREATE TABLE `bookmark` (
	`userId` varchar(128) NOT NULL,
	`postId` varchar(128) NOT NULL,
	CONSTRAINT `bookmark_userId_postId_pk` PRIMARY KEY(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `comment` (
	`userId` varchar(128) NOT NULL,
	`postId` varchar(128) NOT NULL,
	`content` varchar(1024) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comment_userId_postId_pk` PRIMARY KEY(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `post` (
	`id` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` varchar(1024) NOT NULL,
	`price` varchar(50) NOT NULL,
	`userId` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `post_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rating` (
	`userId` varchar(128) NOT NULL,
	`postId` varchar(128) NOT NULL,
	`value` enum('0','1','2','3','4','5') NOT NULL,
	CONSTRAINT `rating_userId_postId_pk` PRIMARY KEY(`userId`,`postId`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` varchar(128) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`isAdmin` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookmark` ADD CONSTRAINT `bookmark_postId_post_id_fk` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment` ADD CONSTRAINT `comment_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comment` ADD CONSTRAINT `comment_postId_post_id_fk` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post` ADD CONSTRAINT `post_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rating` ADD CONSTRAINT `rating_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rating` ADD CONSTRAINT `rating_postId_post_id_fk` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE cascade ON UPDATE no action;