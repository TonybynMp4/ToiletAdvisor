import { initTRPC, TRPCError } from "@trpc/server";
import { getCookie } from "hono/cookie";
import z, { ZodError } from "zod";
import type { Context } from "./context";
import { getRedisClient } from "./lib";

export const t = initTRPC.context<Context>().create({
    isDev: process.env.NODE_ENV !== "production",
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? z.treeifyError(error.cause) : null,
            },
        };
    },
});

export const router = t.router;

export const publicProcedure = t.procedure;

const authMiddleware = t.middleware(async ({ ctx, next }) => {
    const sessionId = getCookie(ctx.honoContext, "session_id");

    if (!sessionId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const redisClient = await getRedisClient();
    const userId = await redisClient.get(`session:${sessionId}`);
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const session = {
        sessionId,
        userId,
    };
    return next({
        ctx: {
            ...ctx,
            session,
        },
    });
});

export const protectedProcedure = t.procedure.use(authMiddleware);
