import { Navigate, Outlet } from "react-router";
import { Spinner } from "@/components/kibo-ui/spinner";
import { useSession } from "@/hooks/use-session";

export default function ProtectedRoute() {
	const { user, isLoading } = useSession();

	if (isLoading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Spinner variant="bars" size={128} />
			</div>
		);

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
