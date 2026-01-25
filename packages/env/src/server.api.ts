import { createEnv } from "@t3-oss/env-core";
import "dotenv/config";
import { z } from "zod";

export const env = createEnv({
    server: {
        CORS_ORIGIN: z.url().default("http://localhost:80"),
        PORT: z.coerce.number().int().min(1).max(65535).default(3000),
        DATABASE_URL: z.url(),
        UPLOADTHING_API_KEY: z.string().min(1),
        NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
