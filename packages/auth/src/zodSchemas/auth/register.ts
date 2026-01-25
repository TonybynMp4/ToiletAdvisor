import z from "zod";
import { passwordSchema } from "./password";

export const registerSchema = z.object({
	name: z.string().min(4, "Le nom doit contenir au moins 4 caractères"),
	password: passwordSchema,
});
export type RegisterSchema = z.infer<typeof registerSchema>;
