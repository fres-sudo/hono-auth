import { container } from "tsyringe";
import { db } from "../infrastracture/database";

// Symbol
export const DatabaseProvider = Symbol("DATABASE_TOKEN");

// Type
export type DatabaseProvider = typeof db;

// Register
container.register<DatabaseProvider>(DatabaseProvider, { useValue: db });
