import type z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema } from "@toiletadvisor/auth/zodSchemas/auth/login";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { Spinner } from "@/components/kibo-ui/spinner";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authTrpc } from "@/utils/trpc";

type Schema = z.infer<typeof loginSchema>;

export default function Login() {
    const [username, setUsername] = useState<string | null>(null);
    const form = useForm<Schema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            name: "",
            password: "",
        },
    });
    const {
        formState: { isSubmitting, isSubmitSuccessful },
    } = form;

    const loginMutation = useMutation(
        authTrpc.auth.login.mutationOptions({
            onSuccess: (data) => {
                setUsername(data.name);
            },
            onError: (error) => {
                if (error.data?.code === "UNAUTHORIZED") {
                    toast.error("Nom d'utilisateur ou mot de passe incorrect");
                    return;
                }
                toast.error("Erreur lors de la connexion");
                console.error(error);
            },
        }),
    );

    const handleSubmit = form.handleSubmit(async (data: Schema) => {
        loginMutation.mutate({ name: data.name, password: data.password });
    });

    if (isSubmitSuccessful && username) {
        return (
            <div className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, stiffness: 300, damping: 25 }}
                    className="h-full py-6 px-3 flex flex-col items-center gap-4"
                >
                    <motion.div
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{
                            delay: 0.3,
                            type: "spring",
                            stiffness: 500,
                            damping: 15,
                        }}
                        className="mb-4 flex justify-center border rounded-full w-fit mx-auto p-2"
                    >
                        <Check className="size-8" />
                    </motion.div>
                    <h2 className="text-center text-2xl text-pretty font-bold mb-2">
                        Bon retour, {username} !
                    </h2>
                    <p className="text-center text-lg text-pretty text-muted-foreground">
                        Vous êtes connecté avec succès.
                    </p>
                    <Button nativeButton={false} render={<Link to="/feed">Continuer</Link>} />
                </motion.div>
            </div>
        );
    }
    return (
        <form
            onSubmit={handleSubmit}
            className="p-2 sm:p-5 md:p-6 w-full h-min rounded-md gap-2 border max-w-lg m-6 m-auto"
        >
            <FieldGroup className="flex flex-col gap-4 mb-4">
                <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
                    Connexion à votre compte
                </h1>

                <Controller
                    name="name"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="gap-1 col-span-full">
                            <FieldLabel htmlFor="name">Nom</FieldLabel>
                            <Input
                                {...field}
                                id="name"
                                type="text"
                                aria-invalid={fieldState.invalid}
                                placeholder="Entrez votre nom d'utilisateur"
                                required
                            />

                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid} className="gap-1 col-span-full">
                            <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                            <Input
                                {...field}
                                aria-invalid={fieldState.invalid}
                                id="password"
                                type="password"
                                placeholder="Mot de passe"
                                required
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />
                <FieldSeparator className="my-1" />
                <p className="text-sm text-muted-foreground text-center ">
                    Pas encore incrit ?{" "}
                    <Link to="/register" className="underline">
                        Créez un compte ici.
                    </Link>
                </p>
            </FieldGroup>
            <div className="flex justify-end items-center w-full">
                <Button disabled={isSubmitting} type="submit" className="w-full">
                    {isSubmitting ? (
                        <>
                            <Spinner variant="ellipsis" /> Connexion...
                        </>
                    ) : (
                        "Se connecter"
                    )}
                </Button>
            </div>
        </form>
    );
}
