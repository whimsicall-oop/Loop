"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUser } from "@/server/auth";
import { dataProvider } from "@/lib/providers";
import type { CompanyMetrics } from "@/types";

export interface HoldingRow {
  id: string;
  company: CompanyMetrics;
  shares: number;
  avgCost: number;
  marketValue: number;
  costBasis: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  weight: number; // % of portfolio market value
}

export interface PortfolioSummary {
  id: string;
  name: string;
  cash: number;
  holdings: HoldingRow[];
  totalMarketValue: number;
  totalCostBasis: number;
  totalValue: number; // holdings + cash
  totalReturn: number;
  totalReturnPct: number;
  dayChange: number;
}

async function ensurePortfolio(userId: string) {
  const existing = await db.portfolio.findFirst({ where: { userId } });
  if (existing) return existing;
  return db.portfolio.create({ data: { userId, name: "My Portfolio", cash: 0 } });
}

export async function getPortfolio(): Promise<PortfolioSummary> {
  const user = await requireDbUser();
  const portfolio = await ensurePortfolio(user.id);
  const holdings = await db.portfolioHolding.findMany({
    where: { portfolioId: portfolio.id },
    include: { company: true },
    orderBy: { createdAt: "asc" },
  });

  const enriched = await Promise.all(
    holdings.map(async (h) => {
      const company = await dataProvider.getCompany(h.company.ticker);
      return { holding: h, company: company! };
    }),
  );

  const totalMarketValue = enriched.reduce(
    (sum, { holding, company }) => sum + holding.shares * company.price,
    0,
  );

  const rows: HoldingRow[] = enriched.map(({ holding, company }) => {
    const marketValue = holding.shares * company.price;
    const costBasis = holding.shares * holding.avgCost;
    const unrealizedPnl = marketValue - costBasis;
    return {
      id: holding.id,
      company,
      shares: holding.shares,
      avgCost: holding.avgCost,
      marketValue,
      costBasis,
      unrealizedPnl,
      unrealizedPnlPct: costBasis ? (unrealizedPnl / costBasis) * 100 : 0,
      weight: totalMarketValue ? (marketValue / totalMarketValue) * 100 : 0,
    };
  });

  const totalCostBasis = rows.reduce((s, r) => s + r.costBasis, 0);
  const totalReturn = totalMarketValue - totalCostBasis;
  const dayChange = enriched.reduce(
    (s, { holding, company }) => s + holding.shares * company.dayChange,
    0,
  );

  return {
    id: portfolio.id,
    name: portfolio.name,
    cash: portfolio.cash,
    holdings: rows,
    totalMarketValue,
    totalCostBasis,
    totalValue: totalMarketValue + portfolio.cash,
    totalReturn,
    totalReturnPct: totalCostBasis ? (totalReturn / totalCostBasis) * 100 : 0,
    dayChange,
  };
}

export async function addHolding(input: {
  ticker: string;
  shares: number;
  avgCost: number;
}) {
  const user = await requireDbUser();
  const portfolio = await ensurePortfolio(user.id);
  const company = await db.company.findUnique({
    where: { ticker: input.ticker.toUpperCase() },
  });
  if (!company) throw new Error("Company not found");
  if (input.shares <= 0 || input.avgCost <= 0)
    throw new Error("Shares and average cost must be positive");

  await db.portfolioHolding.upsert({
    where: {
      portfolioId_companyId: { portfolioId: portfolio.id, companyId: company.id },
    },
    update: { shares: input.shares, avgCost: input.avgCost },
    create: {
      portfolioId: portfolio.id,
      companyId: company.id,
      shares: input.shares,
      avgCost: input.avgCost,
    },
  });
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
}

export async function removeHolding(holdingId: string) {
  const user = await requireDbUser();
  const portfolio = await ensurePortfolio(user.id);
  await db.portfolioHolding.deleteMany({
    where: { id: holdingId, portfolioId: portfolio.id },
  });
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
}
