import z from "zod";
import { passwordSchema } from "./password";

export const registerSchema = z.object({
	email: z.email(),
	password: passwordSchema,
	name: z.string().min(4, "Le nom doit contenir au moins 4 caractères"),
});
export type RegisterSchema = z.infer<typeof registerSchema>;
