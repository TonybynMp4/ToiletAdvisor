import { db } from "@toiletadvisor/db";
import { user } from "@toiletadvisor/db/schema/index";
import { eq } from "drizzle-orm";
import { deleteCookie, setCookie } from "hono/cookie";
import { randomBytes } from "node:crypto";
import { protectedProcedure, publicProcedure, router } from "../index";
import { getRedisClient, hashPassword, verifyPassword } from "../lib";
import { loginSchema } from "../zodSchemas/auth/login";
import { registerSchema } from "../zodSchemas/auth/register";

const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 jours

export const authRouter = router({
	register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
		const existingUser = await db.query.user.findFirst({
			where: eq(user.name, input.name),
		});

		if (existingUser) {
			throw new Error("Ce nom est déjà utilisé");
		}

		const hashedPassword = await hashPassword(input.password);

		const [newUser] = await db
			.insert(user)
			.values({
				name: input.name,
				password: hashedPassword,
			})
			.$returningId();

		if (!newUser) {
			throw new Error("Erreur lors de la création de l'utilisateur");
		}

		return {
			name: input.name,
		};
	}),

	login: publicProcedure.input(loginSchema).mutation(async ({ input, ctx }) => {
		const queriedUser = await db.query.user.findFirst({
			where: eq(user.name, input.name),
		});

		if (!queriedUser) {
			throw new Error("Nom ou mot de passe incorrect");
		}

		const isValid = await verifyPassword(queriedUser.password, input.password);
		if (!isValid) {
			throw new Error("Nom ou mot de passe incorrect");
		}

		const redisClient = await getRedisClient();
		const sessionId = randomBytes(32).toString("hex");
		await redisClient.set(`session:${sessionId}`, queriedUser.id, {
			expiration: {
				type: "EX",
				value: SESSION_EXPIRY,
			},
		});

		setCookie(ctx.honoContext, "session_id", sessionId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Lax",
			maxAge: SESSION_EXPIRY,
			path: "/",
		});

		return {
			name: queriedUser.name,
		};
	}),
	logout: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.session) {
			const redisClient = await getRedisClient();
			await redisClient.del(`session:${ctx.session.sessionId}`);
		}

		deleteCookie(ctx.honoContext, "session_id", {
			path: "/",
		});

		return { success: true };
	}),
	getSession: protectedProcedure.query(async ({ ctx }) => {
		if (!ctx.session) {
			return null;
		}

		const queriedUser = await db.query.user.findFirst({
			where: eq(user.id, ctx.session.userId),
			columns: {
				id: true,
				name: true,
				isAdmin: true,
			},
		});

		return queriedUser ?? null;
	}),
});
