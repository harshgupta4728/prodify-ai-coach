const config = require('./config');

const FROM_NAME = 'Prodify AI Coach';

// Use Brevo HTTP API instead of SMTP (Render free tier blocks SMTP ports)
const sendMail = async ({ to, subject, html }) => {
  if (!config.brevoApiKey) {
    // Never print emails (they contain OTP codes) to production logs
    if (config.isProduction) {
      throw new Error('BREVO_API_KEY is not set, so emails cannot be sent');
    }
    // Local development without a Brevo key: print the email (and any OTP in it) instead
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`[dev email, not sent] to: ${to} | subject: ${subject} | ${text}`);
    return { messageId: 'dev-console' };
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': config.brevoApiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: config.emailFrom },
      to: [{ email: to }],
      subject,
      htmlContent: html
    }),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return { messageId: data.messageId };
};

module.exports = { sendMail };
