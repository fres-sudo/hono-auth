import { rateLimiter } from "hono-rate-limiter";
import type { HonoTypes } from "./../types/hono.type";

export function limiter({
  limit,
  minutes,
  key = "",
}: {
  limit: number;
  minutes: number;
  key?: string;
}) {
  return rateLimiter({
    windowMs: minutes * 60 * 1000, // every x minutes
    limit, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    keyGenerator: (c) => {
      const vars = c.var as HonoTypes["Variables"];
      const clientKey = vars.userId || c.req.header("x-forwarded-for");
      const pathKey = key || c.req.routePath;
      return `${clientKey}_${pathKey}`;
    }, // Method to generate custom identifiers for clients.
  });
}
