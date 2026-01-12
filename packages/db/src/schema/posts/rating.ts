import { relations } from "drizzle-orm";
import { mysqlEnum, primaryKey, varchar } from "drizzle-orm/mysql-core";
import { post } from ".";
import { createTable } from "../../utils";
import { user } from "../users";

export const rating = createTable(
	"rating",
	{
		userId: varchar({ length: 128 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		postId: varchar({ length: 128 })
			.notNull()
			.references(() => post.id, { onDelete: "cascade" }),
		value: mysqlEnum(["0", "1", "2", "3", "4", "5"]).notNull(),
	},
	(t) => [
		primaryKey({
			columns: [t.userId, t.postId],
		}),
	],
);

export const ratingRelations = relations(rating, ({ one }) => ({
	user: one(user, {
		fields: [rating.userId],
		references: [user.id],
	}),
	post: one(post, {
		fields: [rating.postId],
		references: [post.id],
	}),
}));
