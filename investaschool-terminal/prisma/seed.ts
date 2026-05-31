import { PrismaClient } from "@prisma/client";
import { SEED_COMPANIES, type SeedCompany } from "./seed-data";

const db = new PrismaClient();

const LATEST_FY = 2024;
const YEARS = 5;

/** Back-generates a realistic, internally-consistent 5-year financial history. */
function buildFinancials(c: SeedCompany) {
  const rows = [];
  for (let i = YEARS - 1; i >= 0; i--) {
    const fiscalYear = LATEST_FY - i; // oldest first
    const yearsBack = i;

    const revenue = c.latestRevenue / Math.pow(1 + c.revenueGrowth / 100, yearsBack);
    const marginDrift = c.ticker === "GOTO" ? 5 : 1.2;
    const netMargin = c.latestNetMargin - yearsBack * marginDrift;
    const operatingMargin = c.operatingMargin - yearsBack * (marginDrift * 0.6);
    const grossMargin = c.grossMargin - yearsBack * 0.4;

    const netIncome = (revenue * netMargin) / 100;
    const grossProfit = (revenue * grossMargin) / 100;
    const operatingIncome = (revenue * operatingMargin) / 100;
    const ebitda = operatingIncome * 1.25;
    const freeCashFlow = netIncome * 0.85;
    const operatingCashFlow = freeCashFlow * 1.3;

    const revRatio = revenue / c.latestRevenue;
    const totalEquity = c.roe !== 0 ? netIncome / (c.roe / 100) : revenue * 0.5;
    const totalAssets = c.roa !== 0 ? netIncome / (c.roa / 100) : revenue;
    const totalDebt = c.totalDebt * revRatio;
    const cash = c.cash * revRatio;
    const eps = netIncome / c.sharesOutstanding;

    rows.push({
      fiscalYear,
      revenue,
      netIncome,
      grossProfit,
      operatingIncome,
      ebitda,
      freeCashFlow,
      operatingCashFlow,
      totalAssets: Math.abs(totalAssets),
      totalEquity: Math.abs(totalEquity),
      totalDebt,
      cash,
      grossMargin,
      operatingMargin,
      netMargin,
      eps,
    });
  }
  return rows;
}

async function main() {
  console.log("🌱 Seeding Investaschool Terminal...");

  for (const c of SEED_COMPANIES) {
    const marketCap = c.price * c.sharesOutstanding;
    const company = await db.company.upsert({
      where: { ticker: c.ticker },
      update: {},
      create: {
        ticker: c.ticker,
        name: c.name,
        exchange: "IDX",
        currency: "IDR",
        sector: c.sector,
        industry: c.industry,
        description: c.description,
        businessModel: c.businessModel,
        website: c.website,
        price: c.price,
        previousClose: c.previousClose,
        marketCap,
        enterpriseValue: marketCap + c.totalDebt - c.cash,
        sharesOutstanding: c.sharesOutstanding,
        dividendYield: c.dividendYield,
        peRatio: c.peRatio,
        pbvRatio: c.pbvRatio,
        evEbitda: c.evEbitda,
        roe: c.roe,
        roa: c.roa,
        beta: c.beta,
      },
    });

    const financials = buildFinancials(c);
    for (const f of financials) {
      await db.financial.upsert({
        where: { companyId_fiscalYear: { companyId: company.id, fiscalYear: f.fiscalYear } },
        update: {},
        create: { companyId: company.id, ...f },
      });
    }
    console.log(`  ✓ ${c.ticker} — ${c.name} (+${financials.length}y financials)`);
  }

  // Demo user with sample watchlist + portfolio (schema showcase / reference).
  const demo = await db.user.upsert({
    where: { clerkId: "demo_user_seed" },
    update: {},
    create: {
      clerkId: "demo_user_seed",
      email: "demo@investaschool.app",
      firstName: "Demo",
      lastName: "Analyst",
    },
  });

  const all = await db.company.findMany();
  const byTicker = (t: string) => all.find((c) => c.ticker === t)!;

  const watchlist = await db.watchlist.upsert({
    where: { id: `${demo.id}-default` },
    update: {},
    create: { id: `${demo.id}-default`, userId: demo.id, name: "Core Watchlist" },
  });
  for (const t of ["BBCA", "BMRI", "TLKM", "GOTO", "ICBP"]) {
    await db.watchlistItem.upsert({
      where: { watchlistId_companyId: { watchlistId: watchlist.id, companyId: byTicker(t).id } },
      update: {},
      create: { watchlistId: watchlist.id, companyId: byTicker(t).id },
    });
  }

  const portfolio = await db.portfolio.upsert({
    where: { id: `${demo.id}-default` },
    update: {},
    create: { id: `${demo.id}-default`, userId: demo.id, name: "Growth Portfolio", cash: 25_000_000 },
  });
  const holdings: Array<[string, number, number]> = [
    ["BBCA", 5000, 8900],
    ["BMRI", 10000, 5800],
    ["ASII", 8000, 5100],
    ["ICBP", 2000, 10200],
  ];
  for (const [t, shares, avgCost] of holdings) {
    await db.portfolioHolding.upsert({
      where: { portfolioId_companyId: { portfolioId: portfolio.id, companyId: byTicker(t).id } },
      update: {},
      create: { portfolioId: portfolio.id, companyId: byTicker(t).id, shares, avgCost },
    });
  }

  console.log(`✅ Seed complete: ${SEED_COMPANIES.length} companies, demo user + watchlist + portfolio.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
