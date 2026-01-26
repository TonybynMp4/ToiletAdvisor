import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { boolean, varchar } from "drizzle-orm/mysql-core";
import { createTable, timeStamps } from "../../utils";
import { post, rating } from "../posts";
import { comment } from "../posts/comment";

export const user = createTable("user", {
    id: varchar({ length: 128 })
        .$defaultFn(() => createId())
        .primaryKey(),
    profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
    name: varchar({ length: 255 }).notNull(),
    password: varchar({ length: 255 }).notNull(),
    isAdmin: boolean().notNull().default(false),
    ...timeStamps,
});

export const userRelations = relations(user, ({ many }) => ({
    posts: many(post),
    comments: many(comment),
    ratings: many(rating),
}));
