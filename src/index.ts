import "reflect-metadata";
import { Hono } from "hono";
import { container } from "tsyringe";
import { AuthController } from "./controllers/auth.controller";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { validateAuthSession } from "./middlewares/auth.middleware";

/* ----------------------------------- Api ---------------------------------- */

const app = new Hono().basePath("/api");

/* --------------------------------- Middleware --------------------------------- */

app.use("*", cors({ origin: "*" })); // Allow CORS for all origins
app.use(validateAuthSession);
app.use(logger());

/* --------------------------------- Routes --------------------------------- */

const authRoutes = container.resolve(AuthController).routes();

app.route("/auth", authRoutes);

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

/* -----------------------------------Exports----------------------------------*/

export default app;
