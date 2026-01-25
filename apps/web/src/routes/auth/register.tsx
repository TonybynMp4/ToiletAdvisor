import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { registerSchema } from "@toiletadvisor/auth/zodSchemas/auth/register";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authTrpcClient } from "@/utils/trpc";
import type { Route } from "./+types/register";

export function meta(_: Route.MetaArgs) {
    return [
        { title: "Inscription - ToiletAdvisor" },
        { name: "description", content: "Créez votre compte ToiletAdvisor" },
    ];
}

export default function Register() {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: { name: string; email: string; password: string }) =>
            authTrpcClient.auth.register.mutate(data),
        onSuccess: () => {
            toast.success("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
            navigate("/dashboard");
        },
        onError: (error) => {
            toast.error(error.message || "Erreur lors de l'inscription");
        },
    });

    const onSubmit = (data: z.infer<typeof registerSchema>) => {
        registerMutation.mutate({
            name: data.name,
            email: data.email,
            password: data.password,
        });
    };

    return (
        <Card className="w-full max-w-lg m-4 mx-auto flex">
            <CardHeader>
                <CardTitle className="text-2xl">Inscription</CardTitle>
                <CardDescription>
                    Créez votre compte pour rejoindre la communauté ToiletAdvisor
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="name">Nom</FieldLabel>
                                    <Input
                                        {...field}
                                        id="name"
                                        autoComplete="name"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Entrez votre nom"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        {...field}
                                        type="email"
                                        id="email"
                                        autoComplete="email"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Entrez votre email"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                                    <Input
                                        {...field}
                                        type="password"
                                        id="password"
                                        autoComplete="new-password"
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Entrez votre mot de passe"
                                        required
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    type="submit"
                    className="w-full"
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending ? "Inscription en cours..." : "S'inscrire"}
                </Button>
                <p>
                    Vous avez déjà un compte ?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                        Connectez-vous
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
