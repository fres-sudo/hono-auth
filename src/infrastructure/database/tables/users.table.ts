import { citext, timestamps } from "./utils";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: citext("email").notNull().unique(),
  password: text("password").notNull(),
  ...timestamps,
});
