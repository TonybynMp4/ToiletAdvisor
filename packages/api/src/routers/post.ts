import { db } from "@toiletadvisor/db";
import { post } from "@toiletadvisor/db/schema/index";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure, router } from "../index";

export const postRouter = router({
	getAll: publicProcedure.query(async () => {
		return await db.select().from(post);
	}),
	getById: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ input }) => {
		return await db.select().from(post).where(eq(post.id, input.id));
	}),
});
