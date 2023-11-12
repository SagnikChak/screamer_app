import * as z from "zod";

export const ScreamValidation = z.object({
  scream: z.string().min(3, { message: 'Minimum 3 characters' }),
  accountId: z.string(),
});

export const CommentValidation = z.object({
  scream: z.string().min(3, { message: "Minimum 3 characters" }),
});
