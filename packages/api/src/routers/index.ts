import { publicProcedure, router } from "../index";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	post: postRouter,
	user: userRouter,
});
export type ApiRouter = typeof appRouter;
