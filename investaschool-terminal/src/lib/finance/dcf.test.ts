import { describe, it, expect } from "vitest";
import { runDcf, buildSensitivity, type DcfInputs } from "./dcf";

const base: DcfInputs = {
  baseFreeCashFlow: 1000,
  revenueGrowth: 0.1,
  operatingMargin: 0.3,
  taxRate: 0.22,
  wacc: 0.1,
  terminalGrowth: 0.03,
  projectionYears: 5,
  netDebt: 0,
  sharesOutstanding: 100,
  currentPrice: 50,
};

describe("runDcf", () => {
  it("produces the requested number of projection years", () => {
    const r = runDcf(base);
    expect(r.projections).toHaveLength(5);
  });

  it("computes a positive enterprise value for sane inputs", () => {
    const r = runDcf(base);
    expect(r.enterpriseValue).toBeGreaterThan(0);
    expect(r.fairValuePerShare).toBeGreaterThan(0);
  });

  it("derives equity value by subtracting net debt", () => {
    const withDebt = runDcf({ ...base, netDebt: 5000 });
    const noDebt = runDcf(base);
    expect(withDebt.equityValue).toBeCloseTo(noDebt.equityValue - 5000, 6);
  });

  it("computes margin of safety relative to current price", () => {
    const r = runDcf(base);
    const expected =
      ((r.fairValuePerShare - base.currentPrice) / base.currentPrice) * 100;
    expect(r.marginOfSafety).toBeCloseTo(expected, 6);
  });

  it("throws when WACC <= terminal growth", () => {
    expect(() => runDcf({ ...base, wacc: 0.03, terminalGrowth: 0.03 })).toThrow();
  });

  it("higher WACC lowers the valuation", () => {
    const low = runDcf({ ...base, wacc: 0.09 });
    const high = runDcf({ ...base, wacc: 0.13 });
    expect(high.fairValuePerShare).toBeLessThan(low.fairValuePerShare);
  });
});

describe("buildSensitivity", () => {
  it("returns a grid matching the step dimensions", () => {
    const grid = buildSensitivity(base);
    expect(grid).toHaveLength(5);
    expect(grid[0]).toHaveLength(5);
  });
});
