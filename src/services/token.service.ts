import { inject, injectable } from "tsyringe";
import { generateRandomString } from "oslo/crypto";
import { TimeSpan, createDate, type TimeSpanUnit } from "oslo";
import { HashingService } from "./hashing.service";

@injectable()
export class TokensService {
  constructor(
    @inject(HashingService) private readonly hashingService: HashingService,
  ) {}

  generateNumberToken(number: number) {
    const alphabet = "1234567890";
    return generateRandomString(number, alphabet);
  }

  generateStringToken(number: number) {
    const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVZ";
    return generateRandomString(number, alphabet);
  }

  generateTokenWithExpiry({
    number,
    time,
    lifespan,
    type,
  }: {
    number: number;
    time: number;
    lifespan: TimeSpanUnit;
    type: "NUMBER" | "STRING";
  }) {
    return {
      token:
        type === "NUMBER"
          ? this.generateNumberToken(number)
          : this.generateStringToken(number),
      expiry: createDate(new TimeSpan(time, lifespan)),
    };
  }

  async generateTokenWithExpiryAndHash({
    number,
    time,
    lifespan,
    type,
  }: {
    number: number;
    time: number;
    lifespan: TimeSpanUnit;
    type: "NUMBER" | "STRING";
  }) {
    const token =
      type === "NUMBER"
        ? this.generateNumberToken(number)
        : this.generateStringToken(number);
    const hashedToken = await this.hashingService.hash(token);
    return {
      token,
      hashedToken,
      expiry: createDate(new TimeSpan(time, lifespan)),
    };
  }
}
