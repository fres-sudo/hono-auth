import { inject, injectable } from "tsyringe";
import { eq } from "drizzle-orm";
import { takeFirstOrThrow } from "../infrastructure/database/utils";
import { DatabaseProvider } from "../providers/database.provider";
import { sessionsTable } from "../infrastructure/database/tables/sessions.table";
import { Repository } from "../interfaces/repository.interface";

@injectable()
export class RefreshTokenRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async storeRefreshToken(userId: string, token: string, expiresAt: Date) {
    return this.db
      .insert(sessionsTable)
      .values({ userId, token, expiresAt })
      .returning()
      .then(takeFirstOrThrow);
  }

  async removeRefreshToken(token: string) {
    return this.db.delete(sessionsTable).where(eq(sessionsTable.token, token));
  }

  async getSessionByToken(refreshToken: string) {
    return this.db.query.sessionsTable.findFirst({
      where: eq(sessionsTable.token, refreshToken),
    });
  }

  async updateRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string,
    expiresAt: Date,
  ) {
    const body = { userId, token: newToken, expiresAt };
    await this.db.transaction(async (trx) => {
      await trx.delete(sessionsTable).where(eq(sessionsTable.token, oldToken));
      await trx.insert(sessionsTable).values(body);
    });
  }

  async invalidateAllTokensForUser(userId: string) {
    return this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId));
  }

  trxHost(trx: DatabaseProvider) {
    return new RefreshTokenRepository(trx);
  }
}
