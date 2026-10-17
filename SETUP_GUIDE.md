# Prodify AI Coach - Setup Guide

## Prerequisites

- Node.js 24 (LTS) and npm
- A MongoDB Atlas cluster (or local MongoDB). Use a separate database for development so local testing never touches real users' data.

## Backend Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` from the template and fill it in:
   ```bash
   cp .env.example .env
   ```
   - `MONGODB_URI`: your connection string. Put a practice database name in it (this project uses `.../prodify_dev?...` locally). The live site's data is in the database called `test`, so never use that one for local testing.
   - `JWT_SECRET`: generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
   - `ADMIN_EMAILS`: your account's email, if you need the admin panel.
   - `BREVO_API_KEY` and `EMAIL_USER`: optional locally. Without them, emails (including OTP codes) are printed in the backend terminal instead of being sent.

   `backend/.env` is git-ignored. Never commit it or paste its values into code or docs.

3. Start the backend:
   ```bash
   npm run dev
   ```
   It runs on `http://localhost:10000` (health check: `http://localhost:10000/api/health`). If a required variable is missing, it stops at startup and names the variable.

4. Check that everything works (any time, especially after making changes):
   ```bash
   npm run smoke-test
   ```
   It signs up a throwaway user in the practice database, goes through the main features (login, tasks, problems, quizzes, email, code runner), deletes the user again, and prints a ✓ or ✗ for each step. Add `-- --verbose` to also see the server's log. It refuses to run against the live database.

## Frontend Setup

From the project root:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:8080`.

`.env.local` only holds `VITE_API_BASE_URL`. Every `VITE_` variable is built into the JavaScript that browsers download, so never put secrets there.

## Signing In Locally

The practice database has its own accounts, separate from the live site. Sign up on `http://localhost:8080`: without a Brevo key, the 6-digit code is printed in the backend terminal window instead of being emailed. To see the admin panel locally, put your email in `ADMIN_EMAILS` in `backend/.env` and restart the backend.

## Loading Content Into a New Database

The seed scripts **delete** the collections they fill, so they print the target cluster and ask for `--yes`:

```bash
cd backend
npm run seed:topics -- --yes            # topics, MCQs, interview questions
npm run seed:problems -- --yes          # problem bank
npm run seed:todays-problems -- --yes   # today's-problem bank (after seed:problems)
```

Don't run them against production unless you mean to reset that content.

## API Endpoints

- `POST /api/auth/send-otp` - Email a 6-digit code (signup or signin)
- `POST /api/auth/signup` - Register (requires the emailed code)
- `POST /api/auth/signin` - Login with password
- `POST /api/auth/signin-otp` - Login with an emailed code
- `GET /api/auth/me` - Current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)
- `GET /api/health` - Health check

## Troubleshooting

1. **Backend exits on start**: the first log line names the missing environment variable.
2. **Frontend can't connect**: make sure the backend is running on port 10000 and `.env.local` contains `VITE_API_BASE_URL=http://localhost:10000/api`.
3. **CORS errors**: in development the backend allows `localhost:8080` and `localhost:5173`. Set `CLIENT_ORIGINS` for other URLs.
4. **"Too many requests" / "Too many failed attempts"**: rate limits reset after their time window. Restarting the backend clears them locally.
5. **No admin panel**: add your email to `ADMIN_EMAILS` in `backend/.env`, restart the backend, and sign in again.

For production, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md).
