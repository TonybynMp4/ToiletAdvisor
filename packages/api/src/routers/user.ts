import { db } from "@toiletadvisor/db";
import { user } from "@toiletadvisor/db/schema/index";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const userRouter = router({
	getAll: publicProcedure.query(async () => {
		return await db.select().from(user);
	}),

	getById: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ input }) => {
		const [userData] = await db
			.select({
				id: user.id,
				name: user.name,
				profilePictureUrl: user.profilePictureUrl,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.id, input.id));

		if (!userData) {
			throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
		}

		return userData;
	}),

	getProfile: protectedProcedure.query(async ({ ctx }) => {
		const [userData] = await db
			.select({
				id: user.id,
				name: user.name,
				profilePictureUrl: user.profilePictureUrl,
				isAdmin: user.isAdmin,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.id, ctx.session.userId));

		if (!userData) {
			throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
		}

		return userData;
	}),

	updateProfile: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(255).optional(),
				profilePictureUrl: z.string().url().max(255).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updateData: Record<string, any> = {};

			if (input.name) {
				// Check if name is already taken
				const [existingUser] = await db
					.select()
					.from(user)
					.where(eq(user.name, input.name));

				if (existingUser && existingUser.id !== ctx.session.userId) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Username already taken",
					});
				}

				updateData.name = input.name;
			}

			if (input.profilePictureUrl !== undefined) {
				updateData.profilePictureUrl = input.profilePictureUrl;
			}

			if (Object.keys(updateData).length > 0) {
				await db.update(user).set(updateData).where(eq(user.id, ctx.session.userId));
			}

			return { success: true };
		}),
});
