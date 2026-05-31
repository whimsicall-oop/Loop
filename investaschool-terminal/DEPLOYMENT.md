# Deployment Guide — Investaschool Terminal

Deploy to **Vercel** with a managed PostgreSQL database and Clerk auth.

---

## 1. Provision PostgreSQL

Use any managed Postgres (Vercel Postgres, Neon, Supabase, Railway, RDS…).
Copy the connection string — you'll set it as `DATABASE_URL`.

> Serverless tip: append `?sslmode=require` and consider a pooled connection
> string (e.g. Neon/Supabase pooler, or Prisma Accelerate) for serverless.

## 2. Configure Clerk

1. Create an application at <https://dashboard.clerk.com>.
2. Enable **Email** and **Google** under *User & Authentication → Social*.
3. Copy the **Publishable key** and **Secret key**.
4. (Optional) Add a webhook → endpoint `https://YOUR_DOMAIN/api/webhooks/clerk`,
   subscribe to `user.created`, `user.updated`, `user.deleted`, and copy the
   **Signing secret** into `CLERK_WEBHOOK_SECRET`.

## 3. Import to Vercel

1. Push this repo to GitHub and **Import** it in Vercel.
2. Set the **Root Directory** to `investaschool-terminal`.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables (Project → Settings → Environment Variables):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Postgres URL |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_…` |
   | `CLERK_SECRET_KEY` | `sk_live_…` |
   | `CLERK_WEBHOOK_SECRET` | `whsec_…` (optional) |
   | `OPENAI_API_KEY` | optional |
   | `OPENAI_MODEL` | `gpt-4o-mini` (optional) |
   | `NEXT_PUBLIC_APP_URL` | `https://YOUR_DOMAIN` |

   The Clerk URL vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, etc.) are optional —
   defaults match the app's routes.

## 4. Run migrations & seed

The `build` script runs `prisma generate`. Apply the schema to your database
**once** from your machine (or a CI step) against the production `DATABASE_URL`:

```bash
DATABASE_URL="<prod-url>" npx prisma migrate deploy
DATABASE_URL="<prod-url>" npm run db:seed      # optional sample data
```

> For continuous deploys, prefer `prisma migrate deploy` (never `migrate dev`)
> in production.

## 5. Deploy

Trigger a deploy. Vercel builds with `npm run build` and serves the app.
Visit your domain, sign up, and you're live.

---

## Going live with real market data

This build ships with seeded sample data behind a `DataProvider` interface.
To use a live feed:

1. Implement `DataProvider` (see `src/lib/providers/types.ts`) for your
   provider (e.g. Financial Modeling Prep, Alpha Vantage).
2. Swap the export in `src/lib/providers/index.ts` — optionally gate on an env
   var so seeded data remains the fallback.

No feature/UI code needs to change.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Missing publishableKey` at build | Set the Clerk env vars in Vercel |
| Prisma `P1001` (can't reach DB) | Check `DATABASE_URL`, SSL mode, and pooling |
| Empty dashboard / no companies | Run `npm run db:seed` against the deployed DB |
| AI reports look templated | Set `OPENAI_API_KEY` (otherwise the fallback engine runs) |
