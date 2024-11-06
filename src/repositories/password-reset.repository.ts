import { inject, injectable } from "tsyringe";
import { and, eq, gte, lte, type InferInsertModel } from "drizzle-orm";
import type { Repository } from "../interfaces/repository.interface";
import { takeFirst, takeFirstOrThrow } from "../infrastructure/database/utils";
import { DatabaseProvider } from "../providers/database.provider";
import { passwordResetTable } from "../infrastructure/database/tables/password-reset.table";
import { CreatePasswordResetRecord } from "../dtos/password-reset.dto";

@injectable()
export class PasswordResetRepository implements Repository {
	constructor(
		@inject(DatabaseProvider) private readonly db: DatabaseProvider
	) {}

	async create(data: CreatePasswordResetRecord) {
		return this.db
			.insert(passwordResetTable)
			.values(data)
			.onConflictDoUpdate({
				target: passwordResetTable.email,
				set: data,
			})
			.returning()
			.then(takeFirstOrThrow);
	}

	async findValidRecordByEmail(email: string) {
		return this.db
			.select()
			.from(passwordResetTable)
			.where(
				and(
					eq(passwordResetTable.email, email),
					gte(passwordResetTable.expiresAt, new Date())
				)
			)
			.then(takeFirst);
	}

	async deleteById(id: string) {
		return this.db
			.delete(passwordResetTable)
			.where(eq(passwordResetTable.id, id));
	}

	trxHost(trx: DatabaseProvider) {
		return new PasswordResetRepository(trx);
	}
}
