import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./tables";
import { config } from "../../types/config.type";

export const client = postgres(config.postgres.url, { max: 10 });
export const db = drizzle(client, { schema });
