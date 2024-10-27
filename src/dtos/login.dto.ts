import { z } from "zod";

export const loginDTO = z.object({
  email: z
    .string({
      required_error: "email-required",
    })
    .email(),
  password: z
    .string({
      required_error: "password-required",
    })
    .min(8, "password-too-short")
    .max(32, "password-too-long"),
});

export type LoginDTO = z.infer<typeof loginDTO>;
