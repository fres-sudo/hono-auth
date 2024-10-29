import { z } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { usersTable } from "./../infrastructure/database/tables";

export const signUpDTO = createInsertSchema(usersTable)
  .extend({
    passwordConfirmation: z.string({
      required_error: "password-confirmation-required",
    }),
    email: z.string().email(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "passwords-donot-match",
    path: ["passwordConfirmation"],
  });

export type SignUpDTO = z.infer<typeof signUpDTO>;
