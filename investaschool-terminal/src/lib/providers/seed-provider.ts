import { db } from "@/lib/db";
import type { CompanyMetrics, FinancialYear } from "@/types";
import type { DataProvider } from "./types";
import type { Company, Financial } from "@prisma/client";

function toMetrics(c: Company): CompanyMetrics {
  const dayChange = c.price - c.previousClose;
  const dayChangePct = c.previousClose
    ? (dayChange / c.previousClose) * 100
    : 0;
  return {
    id: c.id,
    ticker: c.ticker,
    name: c.name,
    exchange: c.exchange,
    currency: c.currency,
    sector: c.sector,
    industry: c.industry,
    description: c.description,
    businessModel: c.businessModel,
    website: c.website,
    logoUrl: c.logoUrl,
    price: c.price,
    previousClose: c.previousClose,
    marketCap: c.marketCap,
    enterpriseValue: c.enterpriseValue,
    sharesOutstanding: c.sharesOutstanding,
    dividendYield: c.dividendYield,
    peRatio: c.peRatio,
    pbvRatio: c.pbvRatio,
    evEbitda: c.evEbitda,
    roe: c.roe,
    roa: c.roa,
    beta: c.beta,
    dayChange,
    dayChangePct,
  };
}

function toFinancial(f: Financial): FinancialYear {
  return {
    fiscalYear: f.fiscalYear,
    revenue: f.revenue,
    netIncome: f.netIncome,
    grossProfit: f.grossProfit,
    operatingIncome: f.operatingIncome,
    ebitda: f.ebitda,
    freeCashFlow: f.freeCashFlow,
    operatingCashFlow: f.operatingCashFlow,
    totalAssets: f.totalAssets,
    totalEquity: f.totalEquity,
    totalDebt: f.totalDebt,
    cash: f.cash,
    grossMargin: f.grossMargin,
    operatingMargin: f.operatingMargin,
    netMargin: f.netMargin,
    eps: f.eps,
  };
}

/** Default provider backed by seeded data in PostgreSQL. */
export class SeedProvider implements DataProvider {
  readonly name = "seed";

  async searchCompanies(query: string): Promise<CompanyMetrics[]> {
    const q = query.trim();
    if (!q) return [];
    const companies = await db.company.findMany({
      where: {
        OR: [
          { ticker: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { sector: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { marketCap: "desc" },
      take: 20,
    });
    return companies.map(toMetrics);
  }

  async getCompany(ticker: string): Promise<CompanyMetrics | null> {
    const company = await db.company.findUnique({
      where: { ticker: ticker.toUpperCase() },
    });
    return company ? toMetrics(company) : null;
  }

  async getFinancials(ticker: string): Promise<FinancialYear[]> {
    const company = await db.company.findUnique({
      where: { ticker: ticker.toUpperCase() },
      include: { financials: { orderBy: { fiscalYear: "asc" } } },
    });
    return company ? company.financials.map(toFinancial) : [];
  }

  async listAll(): Promise<CompanyMetrics[]> {
    const companies = await db.company.findMany({
      orderBy: { marketCap: "desc" },
    });
    return companies.map(toMetrics);
  }
}
