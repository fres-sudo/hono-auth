import type { Config } from "drizzle-kit";
import { config } from "./src/types/config.type";

export default {
  out: "./src/infrastructure/database/migrations",
  schema: "./src/infrastracture/database/tables/index.ts",
  breakpoints: false,
  strict: true,
  dialect: "postgresql",
  dbCredentials: {
    url: config.postgres.url,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
  verbose: true,
} satisfies Config;
