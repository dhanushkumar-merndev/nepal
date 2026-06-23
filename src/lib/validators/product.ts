import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category: z.string().min(1),
  description: z.string().optional(),
  logo_url: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  stock_status: z.string().min(1),
  is_best_seller: z.boolean().default(false),
  is_active: z.boolean().default(true),
});
