import { inject, injectable } from "tsyringe";
import { DatabaseProvider } from "../providers/database.provider";
import { and, eq, gte, lte, type InferInsertModel } from "drizzle-orm";
import type { Repository } from "../interfaces/repository.interface";
import { takeFirst, takeFirstOrThrow } from "../infrastructure/database/utils";
import { emailVerificationsTable } from "../infrastructure/database/tables/email-verifications.table";

export type CreateEmailVerification = Pick<
  InferInsertModel<typeof emailVerificationsTable>,
  "requestedEmail" | "hashedToken" | "userId" | "expiresAt"
>;

@injectable()
export class EmailVerificationsRepository implements Repository {
  constructor(
    @inject(DatabaseProvider) private readonly db: DatabaseProvider,
  ) {}

  async create(data: CreateEmailVerification) {
    return this.db
      .insert(emailVerificationsTable)
      .values(data)
      .onConflictDoUpdate({
        target: emailVerificationsTable.userId,
        set: data,
      })
      .returning()
      .then(takeFirstOrThrow);
  }

  async findValidRecord(userId: string) {
    return this.db
      .select()
      .from(emailVerificationsTable)
      .where(
        and(
          eq(emailVerificationsTable.userId, userId),
          gte(emailVerificationsTable.expiresAt, new Date()),
        ),
      )
      .then(takeFirst);
  }

  async deleteById(id: string) {
    return this.db
      .delete(emailVerificationsTable)
      .where(eq(emailVerificationsTable.id, id));
  }

  trxHost(trx: DatabaseProvider) {
    return new EmailVerificationsRepository(trx);
  }
}
