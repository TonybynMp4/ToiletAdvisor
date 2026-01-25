import { useMutation } from "@tanstack/react-query";
import { LogOut, User } from "lucide-react";
import { NavLink, useNavigate } from "react-router";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import { authTrpc, queryClient } from "@/utils/trpc";
import { ModeToggle } from "./mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
    const { user } = useSession();
    const navigate = useNavigate();

    const publicLinks = [{ to: "/", label: "Accueil" }] as const;

    const protectedLinks = [
        { to: "/feed", label: "Feed" },
        { to: "/search", label: "Recherche" },
    ] as const;

    const logoutMutation = useMutation(
        authTrpc.auth.logout.mutationOptions({
            onSuccess: () => {
                queryClient.clear();
                toast.success("Déconnexion réussie");
                navigate("/login");
            },
            onError: () => {
                toast.error("Échec de la déconnexion");
            },
        }),
    );

    const handleLogout = () => {
        logoutMutation.mutate();
    };

    return (
        <div className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/80">
            <div className="mx-auto flex max-w-7xl flex-row items-center justify-between px-4 py-4">
                <div className="flex items-center gap-8">
                    <NavLink to="/" className="flex items-center gap-2">
                        <img className="size-8" src="/toiletadvisor.png" alt="ToiletAdvisor Logo" />
                        <span className="hidden text-cyan-600 dark:text-cyan-400 text-xl font-bold sm:inline">
                            ToiletAdvisor
                        </span>
                    </NavLink>

                    <nav className="flex gap-6 text-sm font-semibold">
                        {publicLinks.map(({ to, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `transition-colors ${
                                        isActive
                                            ? "text-slate-900 dark:text-slate-100"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                    }`
                                }
                                end
                            >
                                {label}
                            </NavLink>
                        ))}
                        {user &&
                            protectedLinks.map(({ to, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    className={({ isActive }) =>
                                        `transition-colors ${
                                            isActive
                                                ? "text-slate-900 dark:text-slate-100"
                                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                                        }`
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <ModeToggle />
                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full"
                                        nativeButton={false}
                                    >
                                        <Avatar className="h-10 w-10 transition-shadow hover:shadow-lg hover:shadow-cyan-500/50">
                                            <AvatarImage
                                                src={user.profilePictureUrl || undefined}
                                            />
                                            <AvatarFallback className="bg-cyan-600 font-bold text-white">
                                                {user.name?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                }
                            />
                            <DropdownMenuContent
                                align="end"
                                className="w-56 border-slate-200/50 bg-white/95 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/95"
                            >
                                <div className="px-3 py-2">
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {user.name}
                                    </p>
                                </div>
                                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-800/50" />
                                <DropdownMenuItem
                                    render={
                                        <NavLink
                                            to="/profile"
                                            className="flex cursor-pointer items-center"
                                        >
                                            <User className="mr-3 h-4 w-4" />
                                            Profil
                                        </NavLink>
                                    }
                                />
                                <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-800/50" />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    disabled={logoutMutation.isPending}
                                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-900/20"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    {logoutMutation.isPending ? "Déconnexion..." : "Se Déconnecter"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                render={<NavLink to="/login">Connexion</NavLink>}
                                nativeButton={false}
                                variant="ghost"
                                size="sm"
                                className="font-semibold"
                            />
                            <Button
                                render={<NavLink to="/register">Inscription</NavLink>}
                                nativeButton={false}
                                size="sm"
                                className="bg-cyan-600 hover:bg-cyan-700 font-semibold text-white"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
