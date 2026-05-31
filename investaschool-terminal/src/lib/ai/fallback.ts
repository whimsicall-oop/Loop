import type { CompanyMetrics, FinancialYear, ResearchContent, Rating } from "@/types";
import { revenueCagr, earningsCagr, valuationVerdict } from "@/lib/finance/ratios";
import { formatPrice } from "@/lib/utils";

/**
 * Deterministic, data-driven research generator used when no OPENAI_API_KEY
 * is configured. It is NOT random — it reasons from the company's actual
 * fundamentals so the app is fully functional offline / without a key.
 */
export function generateFallbackReport(
  company: CompanyMetrics,
  financials: FinancialYear[],
): ResearchContent {
  const series = financials.map((f) => ({
    fiscalYear: f.fiscalYear,
    revenue: f.revenue,
    netIncome: f.netIncome,
    freeCashFlow: f.freeCashFlow,
    totalEquity: f.totalEquity,
    totalAssets: f.totalAssets,
  }));
  const revCagr = revenueCagr(series);
  const epsCagr = earningsCagr(series);
  const latest = financials[financials.length - 1];

  // Simple scorecard → rating
  let score = 0;
  if (revCagr > 10) score += 1;
  if (epsCagr > 10) score += 1;
  if (company.roe > 15) score += 1;
  if (company.peRatio > 0 && company.peRatio < 18) score += 1;
  if (company.dividendYield > 2) score += 1;
  if ((latest?.netMargin ?? 0) > 12) score += 1;

  const rating: Rating = score >= 4 ? "BUY" : score >= 2 ? "HOLD" : "SELL";
  const targetMultiplier = rating === "BUY" ? 1.18 : rating === "HOLD" ? 1.04 : 0.88;
  const targetPrice = Math.round(company.price * targetMultiplier);
  const verdict = valuationVerdict(
    ((targetPrice - company.price) / company.price) * 100,
  );

  const cur = company.currency;

  return {
    title: `${company.name} (${company.ticker}) — Initiating Coverage`,
    rating,
    targetPrice,
    executiveSummary: `${company.name} operates in the ${company.industry} segment of the ${company.sector} sector. Over the trailing period the company compounded revenue at roughly ${revCagr.toFixed(
      1,
    )}% and earnings at ${epsCagr.toFixed(
      1,
    )}%, with a return on equity of ${company.roe.toFixed(
      1,
    )}%. We initiate at ${rating} with a 12-month target of ${formatPrice(
      targetPrice,
      cur,
    )}, implying the shares appear ${verdict.label.toLowerCase()} versus current levels of ${formatPrice(
      company.price,
      cur,
    )}.`,
    businessOverview: `${company.businessModel ?? company.description} The business currently trades at a P/E of ${company.peRatio.toFixed(
      1,
    )}x and P/BV of ${company.pbvRatio.toFixed(
      1,
    )}x, with an enterprise value to EBITDA multiple of ${company.evEbitda.toFixed(
      1,
    )}x. Latest fiscal-year net margin stood at ${latest?.netMargin.toFixed(1)}%.`,
    competitiveAdvantages: [
      `Established position within ${company.industry} with a ${company.roe.toFixed(0)}% ROE indicating efficient capital deployment.`,
      revCagr > 8
        ? `Above-trend revenue growth (${revCagr.toFixed(1)}% CAGR) signalling demand strength.`
        : `Stable revenue base providing earnings visibility.`,
      (latest?.freeCashFlow ?? 0) > 0
        ? `Positive free cash flow generation supporting reinvestment and distributions.`
        : `Scale advantages within its core market.`,
      `Brand and distribution depth within the ${company.exchange} listed universe.`,
    ],
    risks: [
      `Valuation re-rating risk if growth decelerates below the ${revCagr.toFixed(0)}% trend.`,
      `Sector cyclicality and macroeconomic sensitivity (beta ${company.beta.toFixed(2)}).`,
      `Margin pressure from input costs or competitive intensity in ${company.industry}.`,
      `Regulatory and FX exposure inherent to ${company.exchange}-listed equities.`,
    ],
    opportunities: [
      `Expansion of the ${company.industry} addressable market.`,
      `Operating leverage as scale improves margins from the current ${latest?.operatingMargin.toFixed(0)}% level.`,
      `Capital return optionality given a ${company.dividendYield.toFixed(1)}% dividend yield.`,
    ],
    swot: {
      strengths: [
        `ROE of ${company.roe.toFixed(1)}%`,
        `Revenue CAGR ${revCagr.toFixed(1)}%`,
        `Net margin ${latest?.netMargin.toFixed(1)}%`,
      ],
      weaknesses: [
        company.peRatio > 25 ? `Elevated P/E of ${company.peRatio.toFixed(1)}x` : `Moderate growth profile`,
        (latest?.totalDebt ?? 0) > (latest?.totalEquity ?? 1) ? `Leverage above equity` : `Limited disclosure granularity`,
      ],
      opportunities: [
        `Market expansion in ${company.industry}`,
        `Margin improvement potential`,
      ],
      threats: [
        `Competitive pressure`,
        `Macro / rate sensitivity (beta ${company.beta.toFixed(2)})`,
      ],
    },
    industryOutlook: `The ${company.sector} sector continues to evolve, with ${company.industry} participants navigating shifting demand and cost dynamics. Companies with durable returns on capital and disciplined reinvestment — characteristics ${company.ticker} exhibits to varying degrees — are best positioned through the cycle.`,
    investmentThesis: `Our ${rating} thesis rests on ${company.ticker}'s ${
      revCagr > 8 ? "demonstrated growth" : "earnings stability"
    } and a ${company.roe.toFixed(
      0,
    )}% ROE, weighed against a ${company.peRatio.toFixed(
      1,
    )}x earnings multiple. At ${formatPrice(
      company.price,
      cur,
    )} the risk/reward skews toward our ${formatPrice(targetPrice, cur)} target.`,
    keyCatalysts: [
      `Quarterly earnings versus the implied ${epsCagr.toFixed(0)}% growth trajectory`,
      `Margin trend confirmation`,
      `Capital allocation announcements (dividends / buybacks / capex)`,
    ],
    conclusion: `We rate ${company.ticker} a ${rating} with a ${formatPrice(
      targetPrice,
      cur,
    )} 12-month target. The shares currently look ${verdict.label.toLowerCase()}; investors should size positions in line with the risks outlined above. (Generated by the deterministic template engine — configure OPENAI_API_KEY for narrative AI analysis.)`,
  };
}
