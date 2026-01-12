import { relations } from "drizzle-orm";
import { primaryKey, varchar } from "drizzle-orm/mysql-core";
import { createTable } from "../../utils";
import { post } from "../posts";
import { user } from "../users";

export const bookmark = createTable(
	"bookmark",
	{
		userId: varchar({ length: 128 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar({ length: 128 })
			.notNull()
			.references(() => post.id, { onDelete: "cascade" }),
	},
	(t) => [
		primaryKey({
			columns: [t.userId, t.postId],
		}),
	],
);

export const bookmarkRelations = relations(bookmark, ({ one }) => ({
	user: one(user, {
		fields: [bookmark.userId],
		references: [user.id],
	}),
	post: one(post, {
		fields: [bookmark.postId],
		references: [post.id],
	}),
}));
