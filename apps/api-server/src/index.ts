import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@toiletadvisor/api/context";
import { appRouter } from "@toiletadvisor/api/routers/index";
import { env } from "@toiletadvisor/env/api";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
    "/*",
    cors({
        origin: env.CORS_ORIGIN,
        allowMethods: ["GET", "POST", "OPTIONS"],
        credentials: true,
    }),
);

app.use(
    "/trpc/*",
    trpcServer({
        router: appRouter,
        createContext: (_opts, context) => {
            return createContext({ context });
        },
        onError: ({ path, error, type }) => {
            console.error(`[tRPC Error] ${type} ${path}:`, error);
        },
        responseMeta: ({ ctx: { paths }, type }) => {
            if (process.env.NODE_ENV === "development") {
                console.log(`[tRPC] ${type} ${paths?.join(", ")}`);
            }
            return {};
        },
    }),
);

app.get("/health", (c) => {
    return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
    {
        fetch: app.fetch,
        port: env.PORT,
    },
    (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
    },
);
