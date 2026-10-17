# Prodify AI Coach - Backend

Express + MongoDB (Mongoose) API. Setup: [../SETUP_GUIDE.md](../SETUP_GUIDE.md). Deployment: [../RENDER_DEPLOYMENT.md](../RENDER_DEPLOYMENT.md).

## Layout

- `server.js` - app setup, security middleware, `/api/send-email`, health check
- `lib/config.js` - reads and validates environment variables; the only place secrets are read
- `lib/mailer.js` - sends email through Brevo's HTTP API
- `lib/validate.js` - small input-validation helpers
- `middleware/` - `auth.js` (JWT and admin check), `rateLimiters.js`, `sanitize.js` (strips MongoDB operators from input)
- `routes/` - auth, tasks, progress, topics, code execution
- `models/` - Mongoose schemas
- `seed/`, `seed*.js` - content seed scripts (they delete existing content and require `--yes`)
- `scripts/smokeTest.js` - `npm run smoke-test`: end-to-end check of the main features against the practice database
- `scripts/updateDbPassword.js` - `npm run update-db-password`: apply a new Atlas password locally and prepare the Render values
- `scripts/fixDuplicateProgress.js` - `npm run fix:duplicate-progress`: one-off cleanup of duplicate progress records

Local development uses the practice database `prodify_dev`; the live site uses `test`.

## Email

OTP codes and planner reminders are sent through Brevo's HTTP API, because Render's free tier blocks SMTP ports. Set `BREVO_API_KEY` and `EMAIL_USER` (a sender verified in Brevo). Locally, without a key, emails are printed to the console instead.

`/api/send-email` only sends to the signed-in user's own address, so it can't be used to email anyone else.

## Security Notes

- Secrets come only from environment variables. The server won't start without `MONGODB_URI` and `JWT_SECRET`; without `BREVO_API_KEY` it runs but can't send email in production.
- Topic, MCQ and interview-question changes require an account listed in `ADMIN_EMAILS`.
- Updates only accept known fields (tasks, profile, content), so clients can't set fields such as `userId`.
- Rate limits: 10 failed sign-in/OTP checks per email per 15 minutes; 5 OTP emails per email and 50 per IP per hour; an OTP stops working after 5 wrong guesses; 600 requests per user per 5 minutes; 30 code runs per user per minute; 20 reminder emails per user per hour. Counters are kept in memory: they reset on restart and aren't shared between instances (use a Redis store if you run several).
- Uploaded profile pictures are limited to JPEG, PNG, WebP and GIF, and the file extension comes from the checked type.
