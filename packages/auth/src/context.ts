import { db } from "@toiletadvisor/db";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	return {
		db,
		honoContext: context,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
