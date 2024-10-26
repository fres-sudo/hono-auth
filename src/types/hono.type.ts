import type { Promisify, RateLimitInfo } from "hono-rate-limiter";

export type HonoTypes = {
  Variables: {
    userId: string;
    rateLimit: RateLimitInfo;
    rateLimitStore: {
      getKey?: (key: string) => Promisify<RateLimitInfo | undefined>;
      resetKey: (key: string) => Promisify<void>;
    };
  };
};
