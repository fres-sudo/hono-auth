import type { Config } from "drizzle-kit";
import { config } from "./src/types/config.type";

export default {
  out: "./src/infrastructure/database/migrations",
  schema: "./src/infrastructure/database/tables/index.ts",
  breakpoints: false,
  strict: true,
  dialect: "postgresql",
  dbCredentials: {
    url: config.postgres.localUrl,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
  verbose: true,
} satisfies Config;
