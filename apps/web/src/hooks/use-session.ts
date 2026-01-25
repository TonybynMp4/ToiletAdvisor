import { useQuery } from "@tanstack/react-query";
import { authTrpc } from "@/utils/trpc";

export function useSession() {
	const { data: user, isLoading } = useQuery({
		...authTrpc.auth.getSession.queryOptions(),
		retry: false,
		meta: {
			skipErrorToast: true,
		},
	});

	return {
		user,
		isLoading,
	};
}
