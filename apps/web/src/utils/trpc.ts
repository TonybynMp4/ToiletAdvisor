import type { ApiRouter } from "@toiletadvisor/api/routers/index";
import type { AuthRouter } from "@toiletadvisor/auth/routers/index";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { env } from "@toiletadvisor/env/web";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { toast } from "sonner";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error, query) => {
			toast.error(error.message, {
				action: {
					label: "retry",
					onClick: query.invalidate,
				},
			});
		},
	}),
});

export const apiTrpcClient = createTRPCClient<ApiRouter>({
	links: [
		httpBatchLink({
			url: `${env.VITE_API_URL}/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});
export const authTrpcClient = createTRPCClient<AuthRouter>({
	links: [
		httpBatchLink({
			url: `${env.VITE_AUTH_URL}/trpc`,
			fetch(url, options) {
				return fetch(url, {
					...options,
					credentials: "include",
				});
			},
		}),
	],
});

export const apiTrpc = createTRPCOptionsProxy<ApiRouter>({ client: apiTrpcClient, queryClient });
export const authTrpc = createTRPCOptionsProxy<AuthRouter>({ client: authTrpcClient, queryClient });
