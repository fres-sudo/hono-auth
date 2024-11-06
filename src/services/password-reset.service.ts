import { inject, injectable } from "tsyringe";
import { MailerService } from "./mailer.service";
import { HTTPException } from "hono/http-exception";
import { isWithinExpirationDate } from "oslo";
import { HashingService } from "./hashing.service";
import { TokensService } from "./token.service";
import { UsersRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { BadRequest, InternalError } from "../common/error";
import {
	ResetPasswordDTO,
	ResetPasswordEmailDTO,
} from "../dtos/password-reset.dto";

@injectable()
export class PasswordResetService {
	constructor(
		@inject(HashingService) private readonly hashingService: HashingService,
		@inject(TokensService) private readonly tokensService: TokensService,
		@inject(MailerService) private readonly mailerService: MailerService,
		@inject(UsersRepository) private readonly usersRepository: UsersRepository,
		@inject(PasswordResetRepository)
		private readonly passwordResetRepository: PasswordResetRepository
	) {}

	async validateToken(token: string, email: string) {
		try {
			const record = await this.passwordResetRepository.findValidRecordByEmail(
				email
			);

			if (!record || !isWithinExpirationDate(record?.expiresAt)) {
				throw BadRequest("invalid-or-expired-token");
			}

			const isValidToken = await this.hashingService.verify(
				record?.hashedToken,
				token
			);

			if (!isValidToken) {
				throw BadRequest("invalid-or-expired-token");
			}

			return { status: "success" };
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-veryfing-token");
		}
	}

	async resetPassword(token: string, data: ResetPasswordDTO) {
		try {
			const record = await this.passwordResetRepository.findValidRecordByEmail(
				data.email
			);
			if (!record || !isWithinExpirationDate(record?.expiresAt)) {
				throw BadRequest("invalid-or-expired-token");
			}

			const isValidToken = await this.hashingService.verify(
				record?.hashedToken,
				token
			);

			if (!isValidToken) {
				throw BadRequest("invalid-or-expired-token");
			}
			const user = await this.usersRepository.findOneByEmail(data.email);

			if (!user) {
				throw BadRequest("no-user-with-this-email");
			}

			if (data.newPassword !== data.confirmNewPassword) {
				throw BadRequest("password-donot-match");
			}

			await this.passwordResetRepository.deleteById(record.id);

			const hashedPassword = await this.hashingService.hash(data.newPassword);

			await this.usersRepository.update(user.id, {
				password: hashedPassword,
			});
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-resetting-password");
		}
	}

	async createPasswordResetToken(data: ResetPasswordEmailDTO) {
		try {
			// generate a token, expiry and hash
			const { token, expiry, hashedToken } =
				await this.tokensService.generateTokenWithExpiryAndHash({
					number: 6,
					time: 15,
					lifespan: "m",
					type: "NUMBER",
				});
			const user = await this.usersRepository.findOneByEmail(data.email);

			if (!user) {
				throw BadRequest("no-user-with-this-email");
			}
			//if there is an existing record delete it
			await this.findRecordAndDelete(user.id);
			// create a new email verification record
			await this.passwordResetRepository.create({
				email: user.email,
				hashedToken: hashedToken,
				expiresAt: expiry,
			});

			this.mailerService.sendResetPasswordOTP({
				to: user.email,
				props: {
					otp: token,
				},
			});
		} catch (e) {
			if (e instanceof HTTPException) {
				throw e;
			}
			throw InternalError("error-creating-password-reset-token");
		}
	}

	async findRecordAndDelete(email: string) {
		const existingRecord =
			await this.passwordResetRepository.findValidRecordByEmail(email);
		if (existingRecord) {
			await this.passwordResetRepository.deleteById(existingRecord.id);
		}
	}
}
