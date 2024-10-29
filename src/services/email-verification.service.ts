import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers/database.provider";
import { HashingService } from "./hashing.service";
import { UsersRepository } from "../repositories/user.repository";
import { TokensService } from "./token.service";
import { MailerService } from "./mailer.service";
import { EmailVerificationsRepository } from "../repositories/email-verifications.repository";
import { BadRequest } from "../common/error";

@injectable()
export class EmailVerificationsService {
  constructor(
    @inject(DatabaseProvider) private readonly db: DatabaseProvider,
    @inject(TokensService) private readonly tokensService: TokensService,
    @inject(MailerService) private readonly mailerService: MailerService,
    @inject(HashingService) private readonly hashingService: HashingService,
    @inject(UsersRepository) private readonly usersRepository: UsersRepository,
    @inject(EmailVerificationsRepository)
    private readonly emailVerificationsRepository: EmailVerificationsRepository,
  ) {}

  async dispatchEmailVerificationRequest(
    userId: string,
    requestedEmail: string,
  ) {
    // generate a token and expiry
    const { token, expiry, hashedToken } =
      await this.tokensService.generateTokenWithExpiryAndHash({
        number: 15,
        time: 30,
        lifespan: "m",
        type: "STRING",
      });
    const user = await this.usersRepository.findOneByIdOrThrow(userId);

    // create a new email verification record
    await this.emailVerificationsRepository.create({
      requestedEmail,
      userId,
      hashedToken,
      expiresAt: expiry,
    });

    // A confirmation-required email message to the proposed new address, instructing the user to
    // confirm the change and providing a link for unexpected situations
    this.mailerService.sendEmailVerificationToken({
      to: requestedEmail,
      props: {
        link: token,
      },
    });
  }

  async processEmailVerificationRequest(userId: string, token: string) {
    const validRecord = await this.findAndBurnEmailVerificationToken(
      userId,
      token,
    );
    if (!validRecord) throw BadRequest("invalid-token");
    await this.usersRepository.update(userId, {
      email: validRecord.requestedEmail,
      verified: true,
    });
  }

  private async findAndBurnEmailVerificationToken(
    userId: string,
    token: string,
  ) {
    return this.db.transaction(async (trx) => {
      // find a valid record
      const emailVerificationRecord = await this.emailVerificationsRepository
        .trxHost(trx)
        .findValidRecord(userId);
      if (!emailVerificationRecord) return null;

      // check if the token is valid
      const isValidRecord = await this.hashingService.verify(
        emailVerificationRecord.hashedToken,
        token,
      );
      if (!isValidRecord) return null;

      // burn the token if it is valid
      await this.emailVerificationsRepository
        .trxHost(trx)
        .deleteById(emailVerificationRecord.id);
      return emailVerificationRecord;
    });
  }
}
