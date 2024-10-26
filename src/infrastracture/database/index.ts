import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./tables";

export const client = postgres(Bun.env.DATABASE_URL ?? "", { max: 10 });
export const db = drizzle(client, { schema });
