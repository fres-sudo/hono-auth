import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";
import { injectable } from "tsyringe";
import { Controller } from "../interfaces/controller.interface";

@injectable()
export class AuthController implements Controller {
  controller = new Hono<HonoTypes>();

  constructor() {}

  routes() {
    return this.controller;
  }
}
