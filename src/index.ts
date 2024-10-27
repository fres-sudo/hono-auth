import "reflect-metadata";
import { Hono } from "hono";
import { container } from "tsyringe";
import { AuthController } from "./controllers/auth.controller";
import { logger } from "hono/logger";
import { cors } from "hono/cors";

/* ----------------------------------- Api ---------------------------------- */

const app = new Hono().basePath("/api");

/* --------------------------------- Middleware --------------------------------- */

app.use(logger());

/* --------------------------------- Routes --------------------------------- */

const authRoutes = container.resolve(AuthController).routes();

app.route("/auth", authRoutes);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

/* -----------------------------------Exports----------------------------------*/

export default app;
