import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { type AnyMySqlColumn, varchar } from "drizzle-orm/mysql-core";
import { createTable, timeStamps } from "../../utils";
import { user } from "../users";
import { postMedia } from "./media";
import { rating } from "./rating";

export const post = createTable("post", {
    id: varchar({ length: 128 })
        .$defaultFn(() => createId())
        .primaryKey(),
    title: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 1024 }).notNull(),
    price: varchar({ length: 50 }).notNull(),
    userId: varchar({ length: 128 })
        .notNull()
        .references((): AnyMySqlColumn => user.id, { onDelete: "cascade" }),
    ...timeStamps,
});

export const postRelations = relations(post, ({ one, many }) => ({
    user: one(user, {
        fields: [post.userId],
        references: [user.id],
    }),
    ratings: many(rating),
    postMedia: many(postMedia),
}));
