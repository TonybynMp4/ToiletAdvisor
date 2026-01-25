import { db } from "@toiletadvisor/db";
import { comment, post, postMedia, rating, user } from "@toiletadvisor/db/schema/index";
import { TRPCError } from "@trpc/server";
import { and, eq, like, or, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure, router } from "../index";

export const postRouter = router({
    getAll: publicProcedure
        .input(
            z
                .object({
                    search: z.string().optional(),
                    minRating: z.number().min(0).max(5).optional(),
                    limit: z.number().min(1).max(100).default(50),
                    offset: z.number().min(0).default(0),
                })
                .optional(),
        )
        .query(async ({ input }) => {
            const filters = [];

            if (input?.search) {
                filters.push(
                    or(
                        like(post.title, `%${input.search}%`),
                        like(post.description, `%${input.search}%`),
                    ),
                );
            }

            const posts = await db
                .select({
                    id: post.id,
                    title: post.title,
                    description: post.description,
                    price: post.price,
                    userId: post.userId,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    userName: user.name,
                    userProfilePicture: user.profilePictureUrl,
                })
                .from(post)
                .leftJoin(user, eq(post.userId, user.id))
                .where(filters.length > 0 ? and(...filters) : undefined)
                .limit(input?.limit ?? 50)
                .offset(input?.offset ?? 0)
                .orderBy(sql`${post.createdAt} DESC`);

            // Get ratings and media for each post
            const results = await Promise.all(
                posts.map(async (p) => {
                    const [ratings, media] = await Promise.all([
                        db.select().from(rating).where(eq(rating.postId, p.id)),
                        db.select().from(postMedia).where(eq(postMedia.postId, p.id)),
                    ]);

                    const avgRating =
                        ratings.length > 0
                            ? ratings.reduce((sum, r) => sum + Number(r.value), 0) / ratings.length
                            : null;

                    return {
                        ...p,
                        avgRating,
                        ratingCount: ratings.length,
                        mediaCount: media.length,
                    };
                }),
            );

            // Filter by minRating after aggregation
            const filtered = results.filter((r) => {
                if (input?.minRating && r.avgRating) {
                    return r.avgRating >= input.minRating;
                }
                return true;
            });

            return filtered;
        }),

    getById: publicProcedure.input(z.object({ id: z.string().min(1) })).query(async ({ input }) => {
        const [postData] = await db
            .select({
                id: post.id,
                title: post.title,
                description: post.description,
                price: post.price,
                userId: post.userId,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                userName: user.name,
                userProfilePicture: user.profilePictureUrl,
            })
            .from(post)
            .leftJoin(user, eq(post.userId, user.id))
            .where(eq(post.id, input.id));

        if (!postData) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }

        const media = await db.select().from(postMedia).where(eq(postMedia.postId, input.id));

        const ratings = await db.select().from(rating).where(eq(rating.postId, input.id));

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
            .where(eq(comment.postId, input.id))
            .orderBy(sql`${comment.createdAt} DESC`);

        const avgRating =
            ratings.length > 0
                ? ratings.reduce((sum, r) => sum + Number(r.value), 0) / ratings.length
                : null;

        return {
            ...postData,
            media,
            ratings,
            comments,
            avgRating,
        };
    }),

    create: protectedProcedure
        .input(
            z.object({
                title: z.string().min(1).max(255),
                description: z.string().min(1).max(1024),
                price: z.string().max(50),
                mediaUrls: z.array(z.string().url()).max(10).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [newPost] = await db
                .insert(post)
                .values({
                    title: input.title,
                    description: input.description,
                    price: input.price,
                    userId: ctx.session.userId,
                })
                .$returningId();

            if (!newPost?.id) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create post",
                });
            }

            if (input.mediaUrls && input.mediaUrls.length > 0) {
                await db.insert(postMedia).values(
                    input.mediaUrls.map((url) => ({
                        url,
                        postId: newPost.id,
                        userId: ctx.session.userId,
                    })),
                );
            }

            return { id: newPost.id };
        }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string().min(1),
                title: z.string().min(1).max(255).optional(),
                description: z.string().min(1).max(1024).optional(),
                price: z.string().max(50).optional(),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [existingPost] = await db.select().from(post).where(eq(post.id, input.id));

            if (!existingPost) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
            }

            if (existingPost.userId !== ctx.session.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only update your own posts",
                });
            }

            const updateData: Record<string, any> = {};
            if (input.title) updateData.title = input.title;
            if (input.description) updateData.description = input.description;
            if (input.price) updateData.price = input.price;

            if (Object.keys(updateData).length > 0) {
                await db.update(post).set(updateData).where(eq(post.id, input.id));
            }

            return { success: true };
        }),

    delete: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            const [existingPost] = await db.select().from(post).where(eq(post.id, input.id));

            if (!existingPost) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
            }

            if (existingPost.userId !== ctx.session.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You can only delete your own posts",
                });
            }

            await db.delete(post).where(eq(post.id, input.id));

            return { success: true };
        }),

    rate: protectedProcedure
        .input(
            z.object({
                postId: z.string().min(1),
                value: z.enum(["0", "1", "2", "3", "4", "5"]),
            }),
        )
        .mutation(async ({ ctx, input }) => {
            const [existingPost] = await db.select().from(post).where(eq(post.id, input.postId));

            if (!existingPost) {
                throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
            }

            // Upsert rating
            const [existingRating] = await db
                .select()
                .from(rating)
                .where(and(eq(rating.postId, input.postId), eq(rating.userId, ctx.session.userId)));

            if (existingRating) {
                await db
                    .update(rating)
                    .set({ value: input.value })
                    .where(
                        and(eq(rating.postId, input.postId), eq(rating.userId, ctx.session.userId)),
                    );
            } else {
                await db.insert(rating).values({
                    postId: input.postId,
                    userId: ctx.session.userId,
                    value: input.value,
                });
            }

            return { success: true };
        }),
});
