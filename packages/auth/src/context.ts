import type { Context as HonoContext } from "hono";
import { db } from "@toiletadvisor/db";

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
