import { inject, injectable } from "tsyringe";
import type { Repository } from "../interfaces/repository.interface";
import { eq, type InferInsertModel } from "drizzle-orm";
import { DatabaseProvider } from "../providers/database.provider";
import { BadRequest } from "../common/error";
import { usersTable } from "../infrastructure/database/tables";
import { takeFirstOrThrow } from "../infrastructure/database/utils";

export type CreateUser = InferInsertModel<typeof usersTable>;
export type UpdateUser = Partial<CreateUser>;

@injectable()
export class UsersRepository implements Repository {
  constructor(@inject(DatabaseProvider) private db: DatabaseProvider) {}

  async findAll() {
    return this.db.query.usersTable.findMany();
  }

  async findOneById(id: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.id, id),
    });
  }

  async findOneByIdOrThrow(id: string) {
    const user = await this.findOneById(id);
    if (!user) throw BadRequest("user-not-found");
    return user;
  }

  async findOneByEmail(email: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });
  }

  async create(data: CreateUser) {
    return this.db
      .insert(usersTable)
      .values(data)
      .returning()
      .then(takeFirstOrThrow);
  }

  async update(id: string, data: UpdateUser) {
    return this.db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning()
      .then(takeFirstOrThrow);
  }

  trxHost(trx: DatabaseProvider) {
    return new UsersRepository(trx);
  }
}
