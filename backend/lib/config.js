// Loads and checks environment variables once, at startup. Every secret lives in
// backend/.env locally (see .env.example) or in the Render dashboard in production,
// never in the code.
require('dotenv').config();

// Render sets RENDER on every service, so a deploy that forgets NODE_ENV still gets
// production behaviour (required secrets, no console emails).
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.RENDER);

const list = (value) => (value || '').split(',').map((item) => item.trim()).filter(Boolean);

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}. See backend/.env.example.`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters. Generate one with:');
  console.error('  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  process.exit(1);
}

const devOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
];
const productionOrigins = ['https://prodify-ai-coach-frontend.onrender.com'];

const adminEmails = list(process.env.ADMIN_EMAILS).map((email) => email.toLowerCase());
if (isProduction && adminEmails.length === 0) {
  console.warn('Warning: ADMIN_EMAILS is empty, so nobody can manage topics, MCQs or interview questions.');
}
if (isProduction && !process.env.BREVO_API_KEY) {
  console.warn('Warning: BREVO_API_KEY is not set, so emails (OTP codes, reminders) cannot be sent.');
}

module.exports = {
  isProduction,
  port: Number(process.env.PORT) || 10000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  // Frontend URLs allowed to call the API from a browser
  clientOrigins: list(process.env.CLIENT_ORIGINS).length > 0
    ? list(process.env.CLIENT_ORIGINS)
    : (isProduction ? productionOrigins : devOrigins),
  // Accounts that can use the admin panel (content management)
  adminEmails,
  // How many reverse proxies sit in front of the app; decides what req.ip is.
  // Check it after deploying: /api/health shows the IP the server sees for you.
  trustProxy: process.env.TRUST_PROXY ? parseInt(process.env.TRUST_PROXY, 10) || 0 : (isProduction ? 1 : 0),
  brevoApiKey: process.env.BREVO_API_KEY,
  // Sender address; must be a verified sender in Brevo
  emailFrom: process.env.EMAIL_USER || 'harshgupta4728@gmail.com',
  judge0ApiKey: process.env.JUDGE0_API_KEY,
};
