import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, varchar } from "drizzle-orm/mysql-core";
import { createTable, timeStamps } from "../../utils";
import { bookmark, post, rating } from "../posts";
import { comment } from "../posts/comment";

export const user = createTable("user", {
	id: varchar({ length: 128 })
		.$defaultFn(() => createId())
		.primaryKey(),
	email: varchar({ length: 255 }).notNull().unique(),
	name: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	isAdmin: boolean().notNull().default(false),
	...timeStamps,
});

export const userRelations = relations(user, ({ many }) => ({
	posts: many(post),
	comments: many(comment),
	bookmarks: many(bookmark),
	ratings: many(rating),
}));
