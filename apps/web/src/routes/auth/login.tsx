import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authTrpcClient } from "@/utils/trpc";
import type { Route } from "./+types/login";

export function meta(_: Route.MetaArgs) {
    return [
        { title: "Connexion - ToiletAdvisor" },
        { name: "description", content: "Connectez-vous à votre compte ToiletAdvisor" },
    ];
}

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const loginMutation = useMutation({
        mutationFn: (data: { email: string; password: string }) =>
            authTrpcClient.auth.login.mutate(data),
        onSuccess: (user) => {
            toast.success(`Bienvenue, ${user.name} !`);
            navigate("/dashboard");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de la connexion");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        loginMutation.mutate(formData);
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Connexion</CardTitle>
                    <CardDescription>
                        Connectez-vous à votre compte pour accéder à ToiletAdvisor
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="exemple@email.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                                }
                                disabled={loginMutation.isPending}
                                autoComplete="email"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, password: e.target.value }))
                                }
                                disabled={loginMutation.isPending}
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                            {loginMutation.isPending ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Pas encore de compte ? </span>
                        <Link to="/register" className="text-primary hover:underline">
                            S'inscrire
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
