import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  message: z.string().min(3).max(2000),
});
