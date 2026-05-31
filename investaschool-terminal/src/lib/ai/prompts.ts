import type { CompanyMetrics, FinancialYear } from "@/types";
import { revenueCagr, earningsCagr } from "@/lib/finance/ratios";

/**
 * Modular, reusable prompt library. Each builder returns a self-contained
 * instruction block; `buildResearchPrompt` composes them. Keeping these
 * separate makes prompt engineering iterable and unit-friendly.
 */

const SYSTEM_PERSONA = `You are a senior equity research analyst at an institutional brokerage. \
You write objective, balanced, and rigorous research with clear reasoning. \
You never give personalized financial advice; you frame everything as analysis. \
You are concise, specific, and use professional sell-side language.`;

export function systemPrompt(): string {
  return SYSTEM_PERSONA;
}

/** Compact, model-friendly fundamentals digest shared by every AI workflow. */
export function companyContext(
  company: CompanyMetrics,
  financials: FinancialYear[],
): string {
  const latest = financials[financials.length - 1];
  const revCagr = revenueCagr(
    financials.map((f) => ({
      fiscalYear: f.fiscalYear,
      revenue: f.revenue,
      netIncome: f.netIncome,
      freeCashFlow: f.freeCashFlow,
      totalEquity: f.totalEquity,
      totalAssets: f.totalAssets,
    })),
  );
  const epsCagr = earningsCagr(
    financials.map((f) => ({
      fiscalYear: f.fiscalYear,
      revenue: f.revenue,
      netIncome: f.netIncome,
      freeCashFlow: f.freeCashFlow,
      totalEquity: f.totalEquity,
      totalAssets: f.totalAssets,
    })),
  );

  const history = financials
    .map(
      (f) =>
        `  FY${f.fiscalYear}: revenue=${f.revenue.toFixed(0)}, netIncome=${f.netIncome.toFixed(
          0,
        )}, FCF=${f.freeCashFlow.toFixed(0)}, netMargin=${f.netMargin.toFixed(1)}%`,
    )
    .join("\n");

  return `COMPANY: ${company.name} (${company.ticker}) — ${company.exchange}
Sector: ${company.sector} | Industry: ${company.industry}
Business: ${company.businessModel ?? company.description}
Currency: ${company.currency}

CURRENT METRICS:
- Price: ${company.price}
- Market Cap: ${company.marketCap.toFixed(0)}
- Enterprise Value: ${company.enterpriseValue.toFixed(0)}
- P/E: ${company.peRatio.toFixed(1)} | P/BV: ${company.pbvRatio.toFixed(1)} | EV/EBITDA: ${company.evEbitda.toFixed(1)}
- ROE: ${company.roe.toFixed(1)}% | ROA: ${company.roa.toFixed(1)}% | Dividend Yield: ${company.dividendYield.toFixed(2)}%
- Beta: ${company.beta.toFixed(2)}

GROWTH: revenue CAGR ${revCagr.toFixed(1)}%, earnings CAGR ${epsCagr.toFixed(1)}% (${financials.length}-yr)
LATEST FY${latest?.fiscalYear}: net margin ${latest?.netMargin.toFixed(1)}%, operating margin ${latest?.operatingMargin.toFixed(1)}%

FINANCIAL HISTORY:
${history}`;
}

/** Full equity research report request. Asks for strict JSON for parsing. */
export function buildResearchPrompt(
  company: CompanyMetrics,
  financials: FinancialYear[],
): string {
  return `${companyContext(company, financials)}

TASK: Produce a complete institutional equity research report on ${company.ticker}.
Return ONLY valid minified JSON (no markdown, no commentary) with EXACTLY this shape:

{
  "title": string,
  "rating": "BUY" | "HOLD" | "SELL",
  "targetPrice": number,
  "executiveSummary": string,
  "businessOverview": string,
  "competitiveAdvantages": string[],
  "risks": string[],
  "opportunities": string[],
  "swot": { "strengths": string[], "weaknesses": string[], "opportunities": string[], "threats": string[] },
  "industryOutlook": string,
  "investmentThesis": string,
  "keyCatalysts": string[],
  "conclusion": string
}

Requirements:
- executiveSummary, businessOverview, industryOutlook, investmentThesis, conclusion: 2-4 sentences each, substantive and specific to the numbers above.
- Arrays: 3-5 concise bullet strings each.
- targetPrice: a realistic 12-month figure in ${company.currency}, internally consistent with the rating.
- Be balanced: a BUY must still acknowledge risks.`;
}

/** Standalone investment-thesis workflow (lighter weight). */
export function buildThesisPrompt(
  company: CompanyMetrics,
  financials: FinancialYear[],
): string {
  return `${companyContext(company, financials)}

TASK: Write a focused 1-paragraph investment thesis for ${company.ticker}, then a 1-paragraph bear case. Plain prose, no markdown headers.`;
}

/** Standalone risk-assessment workflow. */
export function buildRiskPrompt(
  company: CompanyMetrics,
  financials: FinancialYear[],
): string {
  return `${companyContext(company, financials)}

TASK: List the 5 most material risks to an investment in ${company.ticker}. Return a JSON array of strings only.`;
}

/** Short company summary workflow for cards/overviews. */
export function buildSummaryPrompt(company: CompanyMetrics): string {
  return `Summarize ${company.name} (${company.ticker}), a ${company.sector} company in ${company.industry}, in 2 neutral sentences for a retail investor. Context: ${company.description}. Return plain text only.`;
}
