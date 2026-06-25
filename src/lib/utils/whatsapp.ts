import type { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils/format";

type CheckoutInput = {
  customerName: string;
  note?: string;
  items: CartItem[];
};

export function buildWhatsAppMessage(input: CheckoutInput) {
  const lines = [
    "Hello Ott Subscription Nepal,",
    "",
    "I want to order:",
    "",
    ...input.items.flatMap((item, index) => [
      `${index + 1}. ${item.productName}`,
      `Plan: ${item.planName}`,
      `Real Price: ${formatPrice(item.realPrice)}`,
      `Offer Price: ${item.offerPrice ? formatPrice(item.offerPrice) : "N/A"}`,
      `Qty: ${item.quantity}`,
      "",
    ]),
    `Total: ${formatPrice(input.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0))}`,
    "",
    `Customer Name: ${input.customerName}`,
    `Note: ${input.note || "N/A"}`,
    "",
    "Please confirm availability.",
  ];

  return lines.join("\n");
}

export function getWhatsAppUrl(message: string) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "977XXXXXXXXXX";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
