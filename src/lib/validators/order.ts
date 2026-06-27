import { z } from "zod";

export const orderSchema = z.object({
  customer_name: z.string().min(2),
  customer_email: z.email().optional(),
  cart_items: z.array(z.unknown()).min(1),
  total_amount: z.coerce.number().min(1),
  whatsapp_sent: z.boolean().default(true),
});
