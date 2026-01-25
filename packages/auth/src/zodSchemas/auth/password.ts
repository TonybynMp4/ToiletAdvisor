import z from "zod";

export const passwordSchema = z
	.string()
	.min(8, "Le mot de passe doit contenir au moins 8 caractères")
	.regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
	.regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
	.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export type PasswordSchema = z.infer<typeof passwordSchema>;
