import { db } from "@toiletadvisor/db";
import { comment, post, user } from "@toiletadvisor/db/schema/index";
import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const commentRouter = router({
	getByPostId: publicProcedure
		.input(
			z.object({
				postId: z.string().min(1),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0),
			}),
		)
		.query(async ({ input }) => {
			const comments = await db
				.select({
					id: comment.id,
					content: comment.content,
					userId: comment.userId,
					postId: comment.postId,
					createdAt: comment.createdAt,
					updatedAt: comment.updatedAt,
					userName: user.name,
					userProfilePicture: user.profilePictureUrl,
				})
				.from(comment)
				.leftJoin(user, eq(comment.userId, user.id))
				.where(eq(comment.postId, input.postId))
				.orderBy(sql`${comment.createdAt} DESC`)
				.limit(input.limit)
				.offset(input.offset);

			return comments;
		}),

	create: protectedProcedure
		.input(
			z.object({
				postId: z.string().min(1),
				content: z.string().min(1).max(1024),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Verify post exists
			const [existingPost] = await db.select().from(post).where(eq(post.id, input.postId));

			if (!existingPost) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
			}

			const [newComment] = await db
				.insert(comment)
				.values({
					postId: input.postId,
					userId: ctx.session.userId,
					content: input.content,
				})
				.$returningId();

			if (!newComment) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Failed to create comment",
				});
			}

			return { id: newComment.id };
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string().min(1),
				content: z.string().min(1).max(1024),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [existingComment] = await db
				.select()
				.from(comment)
				.where(eq(comment.id, input.id));

			if (!existingComment) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
			}

			if (existingComment.userId !== ctx.session.userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own comments",
				});
			}

			await db
				.update(comment)
				.set({ content: input.content })
				.where(eq(comment.id, input.id));

			return { success: true };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string().min(1) }))
		.mutation(async ({ ctx, input }) => {
			const [existingComment] = await db
				.select()
				.from(comment)
				.where(eq(comment.id, input.id));

			if (!existingComment) {
				throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
			}

			if (existingComment.userId !== ctx.session.userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only delete your own comments",
				});
			}

			await db.delete(comment).where(eq(comment.id, input.id));

			return { success: true };
		}),
});
