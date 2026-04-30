const BREVO_API_KEY = process.env.BREVO_API_KEY;
const DEFAULT_FROM_EMAIL = process.env.EMAIL_USER || 'harshgupta4728@gmail.com';
const DEFAULT_FROM_NAME = 'Prodify AI Coach';

// Use Brevo HTTP API instead of SMTP (Render free tier blocks SMTP ports)
const sendMail = async (mailOptions) => {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: DEFAULT_FROM_NAME,
        email: mailOptions.from || DEFAULT_FROM_EMAIL
      },
      to: [{
        email: typeof mailOptions.to === 'string' ? mailOptions.to : mailOptions.to
      }],
      subject: mailOptions.subject,
      htmlContent: mailOptions.html || mailOptions.text || ''
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return { messageId: data.messageId };
};

// Compatible interface with nodemailer transporter
const transporter = {
  sendMail: sendMail
};

module.exports = transporter;
