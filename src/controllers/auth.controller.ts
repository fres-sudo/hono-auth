import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";
import { inject, injectable } from "tsyringe";
import { Controller } from "../interfaces/controller.interface";
import { zValidator } from "@hono/zod-validator";
import { loginDTO } from "../dtos/login.dto";
import { signUpDTO } from "../dtos/signup.dto";
import { AuthService } from "../services/auth.service";
import { limiter } from "../middlewares/limiter.middleware";
import { db } from "../infrastracture/database";

@injectable()
export class AuthController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor(@inject(AuthService) private readonly authService: AuthService) {}

  routes() {
    return this.controller
      .get("/me", async (context) => {
        try {
          const user = await db.query.usersTable.findFirst();
          console.log({ user });
          return context.json(user);
        } catch (e) {
          console.log({ e });
        }
      })
      .post(
        "/login",
        zValidator("json", loginDTO),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const body = context.req.valid("json");
          const user = await this.authService.login(body);
          return context.json(user);
        },
      )
      .post(
        "/signup",
        zValidator("json", signUpDTO),
        limiter({ limit: 10, minutes: 60 }),
        async (context) => {
          const data = context.req.valid("json");
          const newUser = await this.authService.signup(data);
          return context.json(newUser);
        },
      );
  }
}
