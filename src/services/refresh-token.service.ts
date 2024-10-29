import { inject, injectable } from "tsyringe";
import { sign } from "hono/jwt";
import { BadRequest } from "../common/error";
import { config } from "../types/config.type";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository";

@injectable()
export class RefreshTokenService {
  constructor(
    @inject(RefreshTokenRepository)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  // Update refresh token by generating a new one and invalidating the old one
  async refreshToken(refreshToken: string) {
    const session =
      await this.refreshTokenRepository.getSessionByToken(refreshToken);

    if (!session || session.expiresAt < new Date()) {
      throw BadRequest("invalid-refresh-token");
    }

    const newAccessToken = await this.generateAccessToken(session.userId);
    const newRefreshToken = await this.generateRefreshToken(session.userId);

    await this.refreshTokenRepository.updateRefreshToken(
      session.userId,
      refreshToken,
      newRefreshToken,
      config.jwt.refreshExpiresInDate,
    );

    return { refreshToken: newRefreshToken, accessToken: newAccessToken };
  }

  async storeSession(userId: string, refreshToken: string) {
    await this.refreshTokenRepository.storeRefreshToken(
      userId,
      refreshToken,
      config.jwt.refreshExpiresInDate,
    );
  }

  async generateRefreshToken(userId: string) {
    const payload = {
      sub: userId,
      exp: config.jwt.refreshExpiresIn,
    };
    const refreshToken = await sign(payload, config.jwt.refreshSecret);
    return refreshToken;
  }

  async generateAccessToken(userId: string): Promise<string> {
    const payload = {
      sub: userId,
      exp: config.jwt.accessExpiresIn,
    };
    const accessToken = await sign(payload, config.jwt.accessSecret);
    return accessToken;
  }

  async removeRefreshToken(refreshToken: string) {
    await this.refreshTokenRepository.removeRefreshToken(refreshToken);
  }

  async invalidateUserSessions(userId: string) {
    await this.refreshTokenRepository.invalidateAllTokensForUser(userId);
  }
}
