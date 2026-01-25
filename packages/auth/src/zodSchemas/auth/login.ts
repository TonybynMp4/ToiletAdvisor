import z from "zod";
import { registerSchema } from "./register";

export const loginSchema = registerSchema.omit({ name: true });
export type LoginSchema = z.infer<typeof loginSchema>;
