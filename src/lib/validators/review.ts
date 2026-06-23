import { z } from "zod";

export const reviewSchema = z.object({
  product_id: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});
