import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { type AnyMySqlColumn, varchar } from "drizzle-orm/mysql-core";
import { createTable, timeStamps } from "../../utils";
import { user } from "../users";
import { post } from "./post";

export const postMedia = createTable("post_media", {
	id: varchar({ length: 128 })
		.$defaultFn(() => createId())
		.primaryKey(),
	url: varchar({ length: 1024 }).notNull(),
	postId: varchar({ length: 128 })
		.notNull()
		.references((): AnyMySqlColumn => post.id, { onDelete: "cascade" }),
	userId: varchar({ length: 128 })
		.notNull()
		.references((): AnyMySqlColumn => user.id, { onDelete: "cascade" }),
	...timeStamps,
});

export const postMediaRelations = relations(postMedia, ({ one }) => ({
	user: one(user, {
		fields: [postMedia.userId],
		references: [user.id],
	}),
	post: one(post, {
		fields: [postMedia.postId],
		references: [post.id],
	}),
}));
