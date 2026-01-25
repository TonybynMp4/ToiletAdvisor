import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { varchar } from "drizzle-orm/mysql-core";
import { post } from ".";
import { createTable, timeStamps } from "../../utils";
import { user } from "../users";

export const comment = createTable("comment", {
	id: varchar({ length: 128 })
		.$defaultFn(() => createId())
		.primaryKey(),
	userId: varchar({ length: 128 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	postId: varchar({ length: 128 })
		.notNull()
		.references(() => post.id, { onDelete: "cascade" }),
	content: varchar({ length: 1024 }).notNull(),
	...timeStamps,
});

export const commentRelations = relations(comment, ({ one }) => ({
	user: one(user, {
		fields: [comment.userId],
		references: [user.id],
	}),
	post: one(post, {
		fields: [comment.postId],
		references: [post.id],
	}),
}));
