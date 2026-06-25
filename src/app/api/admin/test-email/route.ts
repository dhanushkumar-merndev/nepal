import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/auth/admin";
import { sendOrderThankYouEmail, sendReviewApprovedEmail, sendWinbackEmail } from "@/lib/email/brevo";

export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const to = typeof body?.to === "string" ? body.to : "";
  const name = typeof body?.name === "string" ? body.name : "Test User";
  const type = typeof body?.type === "string" ? body.type : "order";

  if (!to) return NextResponse.json({ error: "Recipient email is required." }, { status: 400 });

  if (type === "review") {
    const result = await sendReviewApprovedEmail({
      to,
      name,
      productName: "Netflix",
      reviewText: "This is a test review approval email from the admin test route.",
    });
    return NextResponse.json({ result });
  }

  if (type === "winback") {
    const result = await sendWinbackEmail({
      to,
      name,
      offerText: "Here is a special test offer for your next plan.",
      buyLink: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      unsubscribeLink: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/privacy`,
      marketingConsent: body?.marketingConsent === true,
      unsubscribed: body?.unsubscribed === true,
    });
    return NextResponse.json({ result });
  }

  const result = await sendOrderThankYouEmail({
    to,
    name,
    orderId: "test-order",
    productName: "Netflix",
    price: "Rs. 299",
  });

  return NextResponse.json({ result });
}
