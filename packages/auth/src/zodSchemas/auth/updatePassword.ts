import { z } from "zod";

export const updatePasswordSchema = z.object({
	currentPassword: z.string().min(8),
	newPassword: z
		.string()
		.min(8)
		.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
		.regex(/[a-z]/, "Password must contain at least one lowercase letter")
		.regex(/[0-9]/, "Password must contain at least one number"),
});
