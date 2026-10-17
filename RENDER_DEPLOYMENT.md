# Render Deployment Guide

## Backend (Web Service)

`render.yaml` describes the service: root directory `backend`, build `npm ci --omit=dev`, start `npm start`, health check `/api/health`.

### Environment Variables

Set these in the Render dashboard (service → Environment). Never commit them.

| Variable | Required | Value |
|---|---|---|
| `NODE_ENV` | Yes | `production` |
| `MONGODB_URI` | Yes | Atlas connection string, including the database name |
| `JWT_SECRET` | Yes | 32+ random characters (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`). Changing it signs everyone out. |
| `BREVO_API_KEY` | Yes, for email | Brevo → SMTP & API → API keys. Without it the site runs, but OTP and reminder emails fail. |
| `EMAIL_USER` | No | Sender address verified in Brevo. Default: `harshgupta4728@gmail.com` |
| `ADMIN_EMAILS` | Yes | Comma-separated emails of accounts that may edit content |
| `CLIENT_ORIGINS` | No | Frontend URL(s). Default: `https://prodify-ai-coach-frontend.onrender.com` |
| `TRUST_PROXY` | No | Default `1`. See below. |
| `JUDGE0_API_KEY` | No | Code runner key. Without it, Wandbox is used. |

If `MONGODB_URI` or `JWT_SECRET` is missing, the server exits at startup and the deploy log names it.

After changing the database password in Atlas, run `cd backend` and `npm run update-db-password`: it checks the new password, updates `backend/.env`, and writes the `MONGODB_URI`, `JWT_SECRET` and `ADMIN_EMAILS` values for Render to `local-only/RENDER-VALUES-delete-after-use.txt`.

### Check TRUST_PROXY After Deploying

Rate limits on OTP emails use the visitor's IP address, which the app reads through Render's proxies. Open `https://<your-backend>.onrender.com/api/health` and compare `clientIp` with your real public IP (search "what is my IP"). If `clientIp` is not your IP (for example a `10.x`, `172.16-31.x` or `100.64.x` address), set `TRUST_PROXY` to the number of addresses listed in `forwardedFor` after your own IP, plus 1, and check again.

## Frontend (Static Site)

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Environment: `VITE_API_BASE_URL=https://<your-backend>.onrender.com/api`

`VITE_` variables are public (built into the browser bundle). Only the API URL belongs here.

## Production Checklist

Do these before sharing the site widely.

**Secrets**
1. **Change the MongoDB password.** Earlier versions of this repo contained the database password (several versions of it) in code and docs, and git history keeps them. In Atlas → Database Access, edit the user and autogenerate a new password, then run `npm run update-db-password` in `backend/` and copy its values into Render.
2. **Set a new `JWT_SECRET` in Render.** The code used to fall back to a secret written in the source, so anyone with the repository could create valid login tokens. Setting a new one signs everyone out once.
3. **Set `ADMIN_EMAILS`.** Only those accounts can now open the admin panel or change topics, MCQs and interview questions.
4. Keep the GitHub repository private, and give collaborators access only as needed.

**Data**

5. **Remove the duplicate progress records** created before this fix: in `backend/`, `npm run fix:duplicate-progress -- --live` shows what would change in the live database, and `npm run fix:duplicate-progress -- --live --yes` applies it (after saving a backup to `local-only/backups/`) and adds the unique index.
6. **Turn on Atlas backups.** Free clusters can keep daily snapshots (Atlas → cluster → Backup); Flex clusters take them automatically.
7. **Keep using the separate practice database (`prodify_dev`) for development**, so local testing and seed scripts never touch the live data in `test`.

**Capacity** (for 1,000-2,000 daily users)

8. **Database:** the Atlas free tier allows 100 operations/second, 0.5 GB of storage and 10 GB of data transfer per week. Move to Flex (500 operations/second, 5 GB) before launch, and M10 if you outgrow it. Set Atlas alerts for connections, storage and operations.
9. **Backend:** Render's free instances sleep when idle and take close to a minute to wake. Use a paid instance.
10. **Email:** Brevo's free plan sends 300 emails a day, which OTP logins and reminders for this many users will exceed. Upgrade the plan.
11. **Profile pictures:** they are saved on the server's disk, which Render wipes on every deploy and restart. Move them to object storage (Cloudinary, S3 or Cloudflare R2).
12. **Code runner:** Wandbox is a free public service with no guarantees, and Judge0's free plan allows 50 runs a day. For real traffic, use a paid Judge0 plan or host Judge0 yourself.

## Troubleshooting

1. Check the Render deploy and runtime logs first; startup errors name the missing variable.
2. `https://<your-backend>.onrender.com/api/health` should show `"database": "connected"`.
3. CORS errors in the browser: make sure `CLIENT_ORIGINS` contains the exact frontend URL (scheme included, no trailing slash).
