import { InferInsertModel } from "drizzle-orm";
import { z } from "zod";
import { passwordResetTable } from "../infrastructure/database/tables/password-reset.table";

export const passwordResetEmailDTO = z.object({
	email: z.string().email(),
});

export const passwordResetEmailVerificationDTO = z.object({
	email: z.string().email(),
	token: z.string().min(6).max(6),
});

export const passwordResetDTO = z
	.object({
		newPassword: z
			.string({ required_error: "required-password" })
			.min(8, "password-too-short")
			.max(32, "password-too-long"),
		confirmNewPassword: z
			.string({ required_error: "required-confirmation-password" })
			.min(8, "password-too-short")
			.max(32, "password-too-long"),
		email: z.string().email(),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "passwords-donot-match",
		path: ["passwordConfirmation"],
	});

export type ResetPasswordEmailDTO = z.infer<typeof passwordResetEmailDTO>;
export type ResetEmailVerificationDTO = z.infer<
	typeof passwordResetEmailVerificationDTO
>;
export type ResetPasswordDTO = z.infer<typeof passwordResetDTO>;
export type CreatePasswordResetRecord = Pick<
	InferInsertModel<typeof passwordResetTable>,
	"hashedToken" | "email" | "expiresAt"
>;
