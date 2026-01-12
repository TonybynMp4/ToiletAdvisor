import { initTRPC } from "@trpc/server";

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
	const session = {};

	if (!session) {
		throw new Error("Utilisateur non authentifié");
	}

	return next({
		ctx: {
			...ctx,
			session,
		},
	});
});

export const protectedProcedure = t.procedure.use(authMiddleware);
