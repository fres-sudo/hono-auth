import type { MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { Unauthorized } from "../common/error";
import { config } from "../types/config.type";

export const validateAuthSession: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    c.set("userId", null);
    return next();
  }

  try {
    // Verify the access token
    const payload = await verify(token, config.jwt.accessSecret);
    const userId = payload.sub as string;

    if (!userId) {
      c.set("userId", null);
      return next();
    }

    // Set user id in context
    c.set("userId", userId);
  } catch (error) {
    // If token verification fails, set user to null
    c.set("user", null);
  }

  return next();
};

export const requireAuth: MiddlewareHandler<{
  Variables: {
    userId: string;
  };
}> = createMiddleware(async (c, next) => {
  const user = c.var.userId;
  if (!user)
    throw Unauthorized("You must be logged in to access this resource");
  return next();
});
