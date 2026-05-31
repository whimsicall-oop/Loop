# Investaschool Terminal

> AI-powered equity research platform for students, retail investors, and aspiring equity research analysts — inspired by Bloomberg Terminal, Capital IQ, Morningstar, TradingView, and the Stripe Dashboard.

Search public companies, analyze financials and valuation, build watchlists and portfolios, run DCF models, generate institutional-style AI research reports, and export polished PDFs.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![TS](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## ✨ Features

| Area | What you get |
|---|---|
| **Auth** | Email + Google sign-in via Clerk; login, register, forgot-password; protected routes |
| **Dashboard** | Modular widgets: Market Overview, Watchlist, Recent Research, Valuation Summary, Portfolio Snapshot |
| **Search** | Find companies by ticker, name, or sector — instant ⌘K palette + full search page |
| **Company Overview** | Summary, business model, key metrics, 5-year financials, revenue/net-income/FCF trend charts |
| **DCF Valuation** | Interactive assumptions (growth, margin, tax, WACC, terminal growth), intrinsic & fair value, margin of safety, **color-coded sensitivity grid**, fair-value-vs-price chart |
| **Comparable Companies** | Auto-discovered peers with P/E, P/BV, EV/EBITDA, ROE, revenue growth + peer medians |
| **AI Research** | Executive summary, business overview, competitive advantages, risks, opportunities, SWOT, industry outlook, investment thesis, catalysts, conclusion, BUY/HOLD/SELL rating + target price |
| **Watchlist** | Add/remove, daily & weekly change, market cap, P/E |
| **Portfolio** | Holdings, allocation pie, 30-day performance, total return, unrealized P/L |
| **PDF Export** | Institutional-style 2-page report (overview, financials, valuation, full AI research, charts) |

Dark-mode-first, fully responsive, premium fintech aesthetic.

---

## 🧱 Tech Stack

- **Next.js 15** (App Router, RSC, Server Actions) + **TypeScript**
- **TailwindCSS** + **shadcn/ui** (Radix primitives)
- **PostgreSQL** + **Prisma ORM**
- **Clerk** authentication
- **OpenAI API** (with a deterministic templated fallback — works with no key)
- **Recharts** for charts, **@react-pdf/renderer** for PDF
- **Vitest** for finance unit tests

---

## 🚀 Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env
#   → set DATABASE_URL and Clerk keys (OpenAI optional)

# 3. Database
npm run db:migrate     # create schema
npm run db:seed        # seed 10 IDX companies + 5y financials + demo data

# 4. Run
npm run dev            # http://localhost:3000
```

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | ✅ | Free dev keys from [Clerk](https://dashboard.clerk.com). Enable Email + Google. |
| `CLERK_WEBHOOK_SECRET` | optional | For `user.*` sync; app also lazy-syncs on first request |
| `OPENAI_API_KEY` | optional | When absent, the deterministic templated report engine is used |
| `OPENAI_MODEL` | optional | Defaults to `gpt-4o-mini` |

---

## 🗂 Project structure

```
investaschool-terminal/
├─ prisma/
│  ├─ schema.prisma         # 9 models + relations
│  ├─ migrations/           # SQL migrations
│  ├─ seed.ts               # seeding runner (back-generates 5y financials)
│  └─ seed-data.ts          # IDX company dataset
├─ src/
│  ├─ app/
│  │  ├─ (auth)/            # sign-in, sign-up, forgot-password
│  │  ├─ (app)/             # dashboard, search, companies, company/[ticker],
│  │  │                     # watchlist, portfolio, valuation, research/[id]
│  │  ├─ api/               # search, reports/[id]/pdf, webhooks/clerk
│  │  ├─ layout.tsx · page.tsx (landing) · not-found.tsx
│  ├─ components/
│  │  ├─ ui/                # shadcn primitives
│  │  ├─ layout/            # sidebar, topbar, global ⌘K search, mobile nav
│  │  ├─ charts/            # trend, allocation pie, bar compare, performance
│  │  ├─ dashboard/         # modular widgets
│  │  ├─ company/ · research/ · portfolio/ · watchlist/ · valuation/
│  ├─ server/               # auth, companies, watchlist, portfolio, valuation, research
│  ├─ lib/
│  │  ├─ finance/           # dcf.ts, ratios.ts, comps.ts (pure, unit-tested)
│  │  ├─ ai/                # prompts.ts, client.ts, fallback.ts
│  │  ├─ providers/         # DataProvider interface + SeedProvider
│  │  ├─ pdf/               # report-document.tsx
│  │  ├─ db.ts · market.ts · utils.ts
│  └─ types/
└─ middleware.ts            # Clerk route protection
```

---

## 🧠 Architecture notes

- **Data-provider abstraction** — all market data flows through the `DataProvider` interface (`src/lib/providers`). The default `SeedProvider` reads seeded Postgres data; swap in a live API (FMP, Alpha Vantage, …) by implementing the same interface in `src/lib/providers/index.ts` with **zero changes to feature code**.
- **Pure finance core** — DCF, ratios, and comparables are side-effect-free TypeScript (`src/lib/finance`), covered by Vitest (`npm test`).
- **Modular prompts** — AI workflows (research, thesis, risk, summary) compose reusable prompt builders in `src/lib/ai/prompts.ts`. The OpenAI client degrades gracefully to a data-driven templated generator when no key is set, so the product is fully functional offline.
- **Server Actions** for all mutations (watchlist, portfolio, valuation, research) with `revalidatePath`.

## 🧪 Scripts

```bash
npm run dev          # dev server
npm run build        # prisma generate + next build
npm run start        # production server
npm test             # finance unit tests (vitest)
npm run typecheck    # tsc --noEmit
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed sample data
npm run db:studio    # Prisma Studio
```

## 📦 Sample data

10 IDX companies (BBCA, BMRI, BBRI, TLKM, ASII, GOTO, UNVR, ICBP, BBNI, ANTM), each with 5 fiscal years of internally-consistent financials, plus a demo watchlist and portfolio.

> ⚠️ All figures are **illustrative educational sample data** and **not investment advice**.

## 🚢 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for a step-by-step Vercel + managed-Postgres guide.

## 📄 License

MIT — for educational use.
