import { initTRPC, TRPCError } from "@trpc/server";
import { getCookie } from "hono/cookie";
import z, { ZodError } from "zod";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create({
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

	if (!sessionId)
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Session cookie not found" });

	const { getRedisClient } = await import("./lib/redis");
	const redisClient = await getRedisClient();
	const userId = await redisClient.get(`session:${sessionId}`);

	if (!userId)
		throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired session" });

	return next({
		ctx: {
			...ctx,
			session: {
				sessionId,
				userId,
			},
		},
	});
});

export const protectedProcedure = t.procedure.use(authMiddleware);
