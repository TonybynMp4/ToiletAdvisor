import { publicProcedure, router } from "../index";
import { commentRouter } from "./comment";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	post: postRouter,
	user: userRouter,
	comment: commentRouter,
});
export type ApiRouter = typeof appRouter;
