import { citext, timestamps } from "./utils";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { sessionsTable } from "./sessions.table";
import { emailVerificationsTable } from "./email-verifications.table";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: citext("email").notNull().unique(),
  password: text("password").notNull(),
  verified: boolean("verified").notNull().default(false),
  ...timestamps,
});

export const usersRelations = relations(usersTable, ({ many, one }) => ({
  sessions: many(sessionsTable),
  emailVerifications: one(emailVerificationsTable, {
    fields: [usersTable.id],
    references: [emailVerificationsTable.userId],
  }),
}));
