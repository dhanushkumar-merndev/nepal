import { getRedis } from "@/lib/ai/cache";

const BREVO_EMAIL_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const MARKETING_DAILY_LIMIT = 100;
const MARKETING_LIMIT_KEY_PREFIX = "brevo:marketing:winback:";

type EmailAddress = {
  email: string;
  name?: string;
};

type BrevoEmailPayload = {
  sender: EmailAddress;
  to: EmailAddress[];
  subject: string;
  htmlContent: string;
};

export type OrderThankYouEmailInput = {
  to: string;
  name: string;
  orderId: string;
  productName: string;
  price: number | string;
};

export type ReviewApprovedEmailInput = {
  to: string;
  name: string;
  productName: string;
  reviewText: string;
};

export type ReviewResponseEmailInput = ReviewApprovedEmailInput & {
  rating: number;
};

export type WinbackEmailInput = {
  to: string;
  name: string;
  offerText: string;
  buyLink: string;
  unsubscribeLink: string;
  marketingConsent?: boolean;
  unsubscribed?: boolean;
};

export type MarketingRecipient = {
  marketingConsent?: boolean | null;
  unsubscribed?: boolean | null;
};

export function canSendMarketingEmail(user: MarketingRecipient) {
  return user.marketingConsent === true && user.unsubscribed !== true;
}

export async function sendOrderThankYouEmail(input: OrderThankYouEmailInput) {
  return sendBrevoEmail({
    to: [{ email: input.to, name: input.name }],
    subject: `Thank you for your order, ${input.name}`,
    htmlContent: layoutTemplate({
      title: "Thank you for your purchase",
      preheader: "Your order has been received.",
      body: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Thank you for your order. We have received your purchase request and will continue the activation/confirmation process.</p>
        <div class="summary">
          <p><strong>Order ID:</strong> ${escapeHtml(input.orderId)}</p>
          <p><strong>Product:</strong> ${escapeHtml(input.productName)}</p>
          <p><strong>Total:</strong> ${escapeHtml(String(input.price))}</p>
        </div>
        <p>If you have any questions, reply to this email or contact us on WhatsApp.</p>
      `,
    }),
    logContext: "order-thank-you",
  });
}

export async function sendReviewApprovedEmail(input: ReviewApprovedEmailInput) {
  return sendBrevoEmail({
    to: [{ email: input.to, name: input.name }],
    subject: "Your review is now live",
    htmlContent: layoutTemplate({
      title: "Your review was approved",
      preheader: "Thank you for sharing your experience.",
      body: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Thanks for reviewing ${escapeHtml(input.productName)}. Your review has been approved and may now appear on our website.</p>
        <div class="quote">${escapeHtml(input.reviewText)}</div>
        <p>We appreciate your trust and support.</p>
      `,
    }),
    logContext: "review-approved",
  });
}

export async function sendReviewAppreciationEmail(input: ReviewResponseEmailInput) {
  return sendBrevoEmail({
    to: [{ email: input.to, name: input.name }],
    subject: `Thank you for your ${input.rating}-star review`,
    htmlContent: layoutTemplate({
      title: "Thank you for the kind review",
      preheader: "We appreciate your support.",
      body: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Thank you for sharing your experience with ${escapeHtml(input.productName)}. Your feedback means a lot to us.</p>
        <div class="quote">${escapeHtml(input.reviewText)}</div>
        <p>We are happy we could help, and we look forward to serving you again.</p>
      `,
    }),
    logContext: "review-appreciation",
  });
}

export async function sendReviewFollowUpEmail(input: ReviewResponseEmailInput) {
  return sendBrevoEmail({
    to: [{ email: input.to, name: input.name }],
    subject: "We would like to improve your experience",
    htmlContent: layoutTemplate({
      title: "Thank you for your honest feedback",
      preheader: "We would like to make this better.",
      body: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>Thank you for reviewing ${escapeHtml(input.productName)}. We are sorry your experience was not perfect.</p>
        <div class="quote">${escapeHtml(input.reviewText)}</div>
        <p>Please reply to this email with what went wrong, and our team will try to help you as soon as possible.</p>
      `,
    }),
    logContext: "review-follow-up",
  });
}

export async function sendWinbackEmail(input: WinbackEmailInput) {
  // Call this from a manual admin action or scheduled job after loading a user/customer record.
  if (!canSendMarketingEmail(input)) {
    console.log("[brevo] winback skipped: marketing consent missing or user unsubscribed", {
      to: input.to,
      marketingConsent: input.marketingConsent,
      unsubscribed: input.unsubscribed,
    });
    return { skipped: true, reason: "marketing-not-allowed" as const };
  }

  const limit = await consumeDailyMarketingLimit();
  if (!limit.allowed) {
    console.log("[brevo] winback skipped: daily marketing limit reached", { to: input.to });
    return { skipped: true, reason: "daily-limit-reached" as const };
  }

  return sendBrevoEmail({
    to: [{ email: input.to, name: input.name }],
    subject: "We miss you - here is something special",
    htmlContent: layoutTemplate({
      title: "We miss you",
      preheader: input.offerText,
      body: `
        <p>Hi ${escapeHtml(input.name)},</p>
        <p>${escapeHtml(input.offerText)}</p>
        <p>
          <a class="button" href="${escapeAttribute(input.buyLink)}">Buy again</a>
        </p>
        <p class="muted">
          You are receiving this because you accepted marketing emails.
          <a href="${escapeAttribute(input.unsubscribeLink)}">Unsubscribe</a>
        </p>
      `,
    }),
    logContext: "winback",
  });
}

async function sendBrevoEmail({
  htmlContent,
  logContext,
  subject,
  to,
}: {
  htmlContent: string;
  logContext: string;
  subject: string;
  to: EmailAddress[];
}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderEmail || !senderName) {
    console.log(`[brevo] ${logContext} skipped: missing BREVO_API_KEY/BREVO_SENDER_EMAIL/BREVO_SENDER_NAME`);
    return { skipped: true, reason: "missing-env" as const };
  }

  const payload: BrevoEmailPayload = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to,
    subject,
    htmlContent,
  };

  try {
    const response = await fetch(BREVO_EMAIL_ENDPOINT, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`[brevo] ${logContext} failed`, {
        status: response.status,
        response: responseText,
        to: to.map((recipient) => recipient.email),
      });
      return { ok: false, status: response.status, error: responseText };
    }

    console.log(`[brevo] ${logContext} sent`, {
      status: response.status,
      response: responseText,
      to: to.map((recipient) => recipient.email),
    });
    return { ok: true, status: response.status, response: responseText };
  } catch (error) {
    console.error(`[brevo] ${logContext} error`, error);
    return { ok: false, error: error instanceof Error ? error.message : "Unknown Brevo error" };
  }
}

async function consumeDailyMarketingLimit() {
  const redis = getRedis();
  if (!redis) {
    console.log("[brevo] marketing daily limit skipped: Redis env missing");
    return { allowed: true, count: 0 };
  }

  const key = `${MARKETING_LIMIT_KEY_PREFIX}${new Date().toISOString().slice(0, 10)}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, secondsUntilTomorrow());
  return { allowed: count <= MARKETING_DAILY_LIMIT, count };
}

function secondsUntilTomorrow() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((tomorrow.getTime() - now.getTime()) / 1000));
}

function layoutTemplate({
  body,
  preheader,
  title,
}: {
  body: string;
  preheader: string;
  title: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { margin: 0; background: #f5f7fb; color: #111827; font-family: Arial, sans-serif; }
      .preheader { display: none; max-height: 0; overflow: hidden; opacity: 0; }
      .wrap { max-width: 620px; margin: 0 auto; padding: 28px 16px; }
      .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 18px; padding: 28px; }
      h1 { margin: 0 0 16px; font-size: 24px; line-height: 1.2; }
      p { margin: 0 0 14px; font-size: 15px; line-height: 1.6; }
      .summary { margin: 18px 0; padding: 16px; background: #eef8fc; border-radius: 14px; }
      .summary p { margin-bottom: 8px; }
      .quote { margin: 18px 0; padding: 16px; border-left: 4px solid #159fd3; background: #f8fafc; font-size: 15px; line-height: 1.6; }
      .button { display: inline-block; background: #159fd3; color: #ffffff !important; text-decoration: none; padding: 12px 18px; border-radius: 999px; font-weight: 700; }
      .muted { color: #6b7280; font-size: 12px; }
      a { color: #0b7fae; }
    </style>
  </head>
  <body>
    <div class="preheader">${escapeHtml(preheader)}</div>
    <div class="wrap">
      <div class="card">
        <h1>${escapeHtml(title)}</h1>
        ${body}
      </div>
    </div>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
