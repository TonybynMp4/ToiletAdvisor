import { mysqlTable, timestamp } from "drizzle-orm/mysql-core";

export const createTable = mysqlTable;

export const timeStamps = {
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
};
