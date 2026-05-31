/**
 * Discounted Cash Flow valuation — pure, side-effect-free.
 * All math lives here so it can be unit-tested in isolation.
 */

export interface DcfInputs {
  /** Most recent annual free cash flow (base year). */
  baseFreeCashFlow: number;
  /** Annual FCF growth rate during the projection window, e.g. 0.10 = 10%. */
  revenueGrowth: number;
  /** Operating margin assumption (informational / scenario tagging). */
  operatingMargin: number;
  /** Effective tax rate, e.g. 0.22. */
  taxRate: number;
  /** Weighted average cost of capital (discount rate), e.g. 0.11. */
  wacc: number;
  /** Perpetual growth rate beyond the projection window, e.g. 0.03. */
  terminalGrowth: number;
  /** Number of explicit projection years. */
  projectionYears: number;
  /** Net debt to bridge enterprise value → equity value (debt - cash). */
  netDebt: number;
  /** Shares outstanding for per-share fair value. */
  sharesOutstanding: number;
  /** Current market price for margin-of-safety. */
  currentPrice: number;
}

export interface DcfYear {
  year: number;
  freeCashFlow: number;
  discountFactor: number;
  presentValue: number;
}

export interface DcfResult {
  projections: DcfYear[];
  pvOfCashFlows: number;
  terminalValue: number;
  pvOfTerminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  /** Equity value (a.k.a. intrinsic value of equity). */
  intrinsicValue: number;
  fairValuePerShare: number;
  currentPrice: number;
  /** % upside/(downside) of fair value vs current price. */
  marginOfSafety: number;
}

/**
 * Runs a standard multi-stage DCF using the Gordon Growth terminal value.
 * Returns per-year projections plus the headline outputs.
 */
export function runDcf(inputs: DcfInputs): DcfResult {
  const {
    baseFreeCashFlow,
    revenueGrowth,
    wacc,
    terminalGrowth,
    projectionYears,
    netDebt,
    sharesOutstanding,
    currentPrice,
  } = inputs;

  if (wacc <= terminalGrowth) {
    throw new Error(
      "WACC must be greater than the terminal growth rate for a finite valuation.",
    );
  }

  const projections: DcfYear[] = [];
  let fcf = baseFreeCashFlow;
  let pvOfCashFlows = 0;

  for (let year = 1; year <= projectionYears; year++) {
    fcf = fcf * (1 + revenueGrowth);
    const discountFactor = 1 / Math.pow(1 + wacc, year);
    const presentValue = fcf * discountFactor;
    pvOfCashFlows += presentValue;
    projections.push({ year, freeCashFlow: fcf, discountFactor, presentValue });
  }

  // Gordon Growth terminal value on the final projected FCF.
  const finalFcf = projections[projections.length - 1].freeCashFlow;
  const terminalValue =
    (finalFcf * (1 + terminalGrowth)) / (wacc - terminalGrowth);
  const pvOfTerminalValue =
    terminalValue / Math.pow(1 + wacc, projectionYears);

  const enterpriseValue = pvOfCashFlows + pvOfTerminalValue;
  const equityValue = enterpriseValue - netDebt;
  const fairValuePerShare =
    sharesOutstanding > 0 ? equityValue / sharesOutstanding : 0;
  const marginOfSafety =
    currentPrice > 0
      ? ((fairValuePerShare - currentPrice) / currentPrice) * 100
      : 0;

  return {
    projections,
    pvOfCashFlows,
    terminalValue,
    pvOfTerminalValue,
    enterpriseValue,
    equityValue,
    intrinsicValue: equityValue,
    fairValuePerShare,
    currentPrice,
    marginOfSafety,
  };
}

export interface SensitivityCell {
  wacc: number;
  terminalGrowth: number;
  fairValuePerShare: number;
}

/**
 * Builds a 2D sensitivity grid of fair value per share across a range of
 * WACC (rows) and terminal-growth (cols) assumptions.
 */
export function buildSensitivity(
  inputs: DcfInputs,
  waccSteps: number[] = [-0.02, -0.01, 0, 0.01, 0.02],
  growthSteps: number[] = [-0.01, -0.005, 0, 0.005, 0.01],
): SensitivityCell[][] {
  return waccSteps.map((dW) =>
    growthSteps.map((dG) => {
      const wacc = +(inputs.wacc + dW).toFixed(4);
      const terminalGrowth = +(inputs.terminalGrowth + dG).toFixed(4);
      let fairValuePerShare = 0;
      try {
        fairValuePerShare = runDcf({
          ...inputs,
          wacc,
          terminalGrowth,
        }).fairValuePerShare;
      } catch {
        fairValuePerShare = NaN;
      }
      return { wacc, terminalGrowth, fairValuePerShare };
    }),
  );
}
