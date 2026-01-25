import { env } from "@toiletadvisor/env/db";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/schema",
    out: "./src/migrations",
    dialect: "mysql",
    dbCredentials: {
        url: env.DATABASE_URL || "",
    },
});
