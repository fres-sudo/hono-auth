import { z } from "zod";

export const refreshTokenDTO = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenDTO = z.infer<typeof refreshTokenDTO>;
