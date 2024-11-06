import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";
import { inject, injectable } from "tsyringe";
import { Controller } from "../interfaces/controller.interface";
import { zValidator } from "@hono/zod-validator";
import { loginDTO } from "../dtos/login.dto";
import { signUpDTO } from "../dtos/signup.dto";
import { AuthService } from "../services/auth.service";
import { limiter } from "../middlewares/limiter.middleware";
import { refreshTokenDTO } from "../dtos/refresh-token.dto";
import { RefreshTokenService } from "../services/refresh-token.service";
import { EmailVerificationsService } from "../services/email-verification.service";
import {
	passwordResetDTO,
	passwordResetEmailDTO,
	passwordResetEmailVerificationDTO,
} from "../dtos/password-reset.dto";
import { PasswordResetService } from "../services/password-reset.service";

@injectable()
export class AuthController implements Controller {
	controller = new Hono<HonoTypes>();

	constructor(
		@inject(AuthService) private readonly authService: AuthService,
		@inject(RefreshTokenService)
		private readonly refreshTokenService: RefreshTokenService,
		@inject(EmailVerificationsService)
		private readonly emailVerificationsService: EmailVerificationsService,
		@inject(PasswordResetService)
		private readonly passwordResetService: PasswordResetService
	) {}

	routes() {
		return this.controller
			.post(
				"/login",
				zValidator("json", loginDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");
					const { user, accessToken, refreshToken } =
						await this.authService.login(body);
					return context.json({ user, accessToken, refreshToken });
				}
			)
			.post(
				"/signup",
				zValidator("json", signUpDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const data = context.req.valid("json");
					const newUser = await this.authService.signup(data);
					return context.json(newUser);
				}
			)
			.post(
				"/refresh-token",
				zValidator("json", refreshTokenDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const refreshTokenBody = context.req.valid("json");
					const { accessToken, refreshToken } =
						await this.refreshTokenService.refreshToken(
							refreshTokenBody.refreshToken
						);
					return context.json({ accessToken, refreshToken });
				}
			)
			.get(
				"/verify/:userId/:token",
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const { userId, token } = context.req.param();
					await this.emailVerificationsService.processEmailVerificationRequest(
						userId,
						token
					);
					// display or return something to the user
					return context.html(`<h1>Email verified!</h1>`);
				}
			)
			.post(
				"/forgotpassword",
				zValidator("json", passwordResetEmailDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const { email } = context.req.valid("json");
					await this.passwordResetService.createPasswordResetToken({
						email,
					});
					return context.json({ status: "success" });
				}
			)
			.post(
				"/verify-token",
				zValidator("json", passwordResetEmailVerificationDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const { email, token } = context.req.valid("json");
					await this.passwordResetService.validateToken(token, email);
					return context.json({ status: "success " });
				}
			)
			.post(
				"/resetpassword/:token",
				zValidator("json", passwordResetDTO),
				limiter({ limit: 10, minutes: 60 }),
				async (context) => {
					const body = context.req.valid("json");
					const token = context.req.param("token");
					await this.passwordResetService.resetPassword(token, body);
					return context.json({ status: "success" });
				}
			);
	}
}
