import z from "zod";
import { registerSchema } from "./register";

export const loginSchema = registerSchema;
export type LoginSchema = z.infer<typeof loginSchema>;
