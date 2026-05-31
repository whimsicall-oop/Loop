/** Shared domain types used across server + client. */

export interface CompanyMetrics {
  id: string;
  ticker: string;
  name: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  description: string;
  businessModel: string | null;
  website: string | null;
  logoUrl: string | null;
  price: number;
  previousClose: number;
  marketCap: number;
  enterpriseValue: number;
  sharesOutstanding: number;
  dividendYield: number;
  peRatio: number;
  pbvRatio: number;
  evEbitda: number;
  roe: number;
  roa: number;
  beta: number;
  dayChange: number;
  dayChangePct: number;
}

export interface FinancialYear {
  fiscalYear: number;
  revenue: number;
  netIncome: number;
  grossProfit: number;
  operatingIncome: number;
  ebitda: number;
  freeCashFlow: number;
  operatingCashFlow: number;
  totalAssets: number;
  totalEquity: number;
  totalDebt: number;
  cash: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  eps: number;
}

export type Rating = "BUY" | "HOLD" | "SELL";

export interface ResearchSection {
  heading: string;
  body: string;
}

export interface ResearchSwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ResearchContent {
  title: string;
  rating: Rating;
  targetPrice: number | null;
  executiveSummary: string;
  businessOverview: string;
  competitiveAdvantages: string[];
  risks: string[];
  opportunities: string[];
  swot: ResearchSwot;
  industryOutlook: string;
  investmentThesis: string;
  keyCatalysts: string[];
  conclusion: string;
}
