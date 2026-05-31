/** Financial ratio + growth helpers — pure functions. */

export interface YearlyFinancial {
  fiscalYear: number;
  revenue: number;
  netIncome: number;
  freeCashFlow: number;
  totalEquity: number;
  totalAssets: number;
}

/** Compound annual growth rate over the series (first → last). */
export function cagr(start: number, end: number, years: number): number {
  if (start <= 0 || years <= 0) return 0;
  return (Math.pow(end / start, 1 / years) - 1) * 100;
}

/** Year-over-year growth for the latest period vs the prior period. */
export function yoyGrowth(values: number[]): number {
  if (values.length < 2) return 0;
  const prev = values[values.length - 2];
  const curr = values[values.length - 1];
  if (!prev) return 0;
  return ((curr - prev) / Math.abs(prev)) * 100;
}

export function revenueCagr(financials: YearlyFinancial[]): number {
  if (financials.length < 2) return 0;
  const sorted = [...financials].sort((a, b) => a.fiscalYear - b.fiscalYear);
  return cagr(
    sorted[0].revenue,
    sorted[sorted.length - 1].revenue,
    sorted.length - 1,
  );
}

export function earningsCagr(financials: YearlyFinancial[]): number {
  if (financials.length < 2) return 0;
  const sorted = [...financials].sort((a, b) => a.fiscalYear - b.fiscalYear);
  return cagr(
    sorted[0].netIncome,
    sorted[sorted.length - 1].netIncome,
    sorted.length - 1,
  );
}

export interface ValuationVerdict {
  label: "Undervalued" | "Fairly valued" | "Overvalued";
  tone: "bull" | "neutral" | "bear";
}

/** Maps margin of safety to a simple verdict for UI badges. */
export function valuationVerdict(marginOfSafety: number): ValuationVerdict {
  if (marginOfSafety >= 15)
    return { label: "Undervalued", tone: "bull" };
  if (marginOfSafety <= -15)
    return { label: "Overvalued", tone: "bear" };
  return { label: "Fairly valued", tone: "neutral" };
}
