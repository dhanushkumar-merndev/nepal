const endpoint = "https://api.brevo.com/v3/smtp/email";

const to = process.argv[2];
if (!to) {
  console.error("Usage: node scripts/test-brevo-email.mjs you@example.com");
  process.exit(1);
}

const apiKey = process.env.BREVO_API_KEY || process.env.EMAIL_API;
const senderEmail = process.env.BREVO_SENDER_EMAIL;
const senderName = process.env.BREVO_SENDER_NAME;

if (!apiKey || !senderEmail || !senderName) {
  console.error("Missing BREVO_API_KEY, BREVO_SENDER_EMAIL, or BREVO_SENDER_NAME.");
  process.exit(1);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    accept: "application/json",
    "api-key": apiKey,
    "content-type": "application/json",
  },
  body: JSON.stringify({
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [{ email: to, name: "Test User" }],
    subject: "Brevo test email",
    htmlContent: "<p>This is a Brevo API test email from OTT Subscription Nepal.</p>",
  }),
});

const text = await response.text();
if (!response.ok) {
  console.error("Brevo test failed:", response.status, text);
  process.exit(1);
}

console.log("Brevo test sent:", response.status, text);
