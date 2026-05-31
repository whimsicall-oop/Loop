import type { CompanyMetrics, FinancialYear } from "@/types";

/**
 * Market-data provider contract. The app talks only to this interface, so a
 * live API (Financial Modeling Prep, Alpha Vantage, etc.) can be dropped in
 * later by implementing `DataProvider` without touching feature code.
 */
export interface DataProvider {
  readonly name: string;
  searchCompanies(query: string): Promise<CompanyMetrics[]>;
  getCompany(ticker: string): Promise<CompanyMetrics | null>;
  getFinancials(ticker: string): Promise<FinancialYear[]>;
  listAll(): Promise<CompanyMetrics[]>;
}
