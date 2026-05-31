import "server-only";
import { dataProvider } from "@/lib/providers";
import { peerMedians, type CompRow } from "@/lib/finance/comps";
import type { CompanyMetrics, FinancialYear } from "@/types";

export async function searchCompanies(query: string): Promise<CompanyMetrics[]> {
  return dataProvider.searchCompanies(query);
}

export async function getCompany(ticker: string): Promise<CompanyMetrics | null> {
  return dataProvider.getCompany(ticker);
}

export async function getFinancials(ticker: string): Promise<FinancialYear[]> {
  return dataProvider.getFinancials(ticker);
}

export async function listCompanies(): Promise<CompanyMetrics[]> {
  return dataProvider.listAll();
}

export interface CompanyBundle {
  company: CompanyMetrics;
  financials: FinancialYear[];
}

export async function getCompanyBundle(
  ticker: string,
): Promise<CompanyBundle | null> {
  const company = await dataProvider.getCompany(ticker);
  if (!company) return null;
  const financials = await dataProvider.getFinancials(ticker);
  return { company, financials };
}

/** Peers = same sector, excluding the target, ranked by market-cap proximity. */
export async function getPeers(
  company: CompanyMetrics,
  limit = 5,
): Promise<CompanyMetrics[]> {
  const all = await dataProvider.listAll();
  return all
    .filter((c) => c.sector === company.sector && c.ticker !== company.ticker)
    .sort(
      (a, b) =>
        Math.abs(a.marketCap - company.marketCap) -
        Math.abs(b.marketCap - company.marketCap),
    )
    .slice(0, limit);
}

export interface CompsResult {
  rows: CompRow[];
  target: CompRow;
  medians: ReturnType<typeof peerMedians>;
}

/** Builds the comparable-company analysis dataset for a ticker. */
export async function getComps(ticker: string): Promise<CompsResult | null> {
  const company = await dataProvider.getCompany(ticker);
  if (!company) return null;
  const peers = await getPeers(company);

  const toRow = async (c: CompanyMetrics): Promise<CompRow> => {
    const fins = await dataProvider.getFinancials(c.ticker);
    const sorted = [...fins].sort((a, b) => a.fiscalYear - b.fiscalYear);
    const last = sorted[sorted.length - 1];
    const prev = sorted[sorted.length - 2];
    const revenueGrowth =
      prev && prev.revenue
        ? ((last.revenue - prev.revenue) / prev.revenue) * 100
        : 0;
    return {
      ticker: c.ticker,
      name: c.name,
      marketCap: c.marketCap,
      peRatio: c.peRatio,
      pbvRatio: c.pbvRatio,
      evEbitda: c.evEbitda,
      roe: c.roe,
      revenueGrowth,
    };
  };

  const target = await toRow(company);
  const rows = await Promise.all(peers.map(toRow));
  return { rows, target, medians: peerMedians(rows) };
}
