import { createEnv } from "@t3-oss/env-core";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import { z } from "zod";

// load root .env files
// + override with the correct host/port for the DB connection from this package's .env file
// with interpolation support (normally handled by docker compose, but we need dotenvexpand here for that)
dotenvExpand.expand(
	dotenv.config({
		path: ["../../.env", ".env"],
		override: true,
	}),
);

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
