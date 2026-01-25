import { Navigate, Outlet } from "react-router";
import { useSession } from "@/hooks/use-session";

export default function ProtectedRoute() {
	const { user, isLoading } = useSession();

	if (isLoading) return <div>Loading...</div>;

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <Outlet />;
}
