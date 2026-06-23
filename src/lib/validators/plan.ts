import { z } from "zod";

export const planSchema = z.object({
  product_id: z.string().min(1),
  name: z.string().min(1),
  duration: z.string().optional().nullable(),
  real_price: z.coerce.number().min(1),
  offer_price: z.coerce.number().optional().nullable(),
  stock_status: z.string().min(1),
  features: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
});
