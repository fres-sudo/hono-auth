import { Hono } from "hono";
import type { HonoTypes } from "./../types/hono.type";
import type { BlankSchema } from "hono/types";

export interface Controller {
  controller: Hono<HonoTypes, BlankSchema, "/">;
  routes(): any;
}
