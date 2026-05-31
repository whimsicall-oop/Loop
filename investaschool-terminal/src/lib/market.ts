import type { CompanyMetrics } from "@/types";

/**
 * Deterministic helpers that synthesize short-term price action from the
 * snapshot data we store (price, previousClose, beta). Values are stable per
 * ticker (seeded PRNG) so the UI is consistent across renders. These stand in
 * for an intraday/historical feed that a live DataProvider would supply.
 */

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable weekly % change derived from ticker + beta + today's move. */
export function deriveWeeklyChange(company: CompanyMetrics): number {
  const rng = mulberry32(hashSeed(company.ticker + "w"));
  const drift = (rng() - 0.45) * 6 * company.beta; // wider for high-beta names
  return +(company.dayChangePct * 1.5 + drift).toFixed(2);
}

export interface PricePoint {
  t: string;
  price: number;
}

/** Synthetic N-day price path ending at the current price (deterministic). */
export function syntheticHistory(
  company: CompanyMetrics,
  days = 30,
): PricePoint[] {
  const rng = mulberry32(hashSeed(company.ticker));
  const vol = 0.012 * Math.max(0.5, company.beta);
  // Walk backwards from current price, then reverse to chronological order.
  const prices: number[] = [company.price];
  for (let i = 1; i < days; i++) {
    const shock = (rng() - 0.5) * 2 * vol;
    prices.push(prices[i - 1] / (1 + shock));
  }
  prices.reverse();
  const today = new Date();
  return prices.map((price, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    return {
      t: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.round(price * 100) / 100,
    };
  });
}
