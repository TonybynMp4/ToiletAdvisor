import { db } from "@toiletadvisor/db";
import { user } from "@toiletadvisor/db/schema/index";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure, router } from "../index";

export const userRouter = router({
	getAll: publicProcedure.query(async () => {
		return await db.select().from(user);
	}),
	getById: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ input }) => {
		return await db.select().from(user).where(eq(user.id, input.id));
	}),
});
