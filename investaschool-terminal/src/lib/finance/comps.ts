/** Comparable company analysis helpers — pure functions. */

export interface CompRow {
  ticker: string;
  name: string;
  marketCap: number;
  peRatio: number;
  pbvRatio: number;
  evEbitda: number;
  roe: number;
  revenueGrowth: number;
}

export interface CompStats {
  peRatio: number;
  pbvRatio: number;
  evEbitda: number;
  roe: number;
  revenueGrowth: number;
}

function median(values: number[]): number {
  const clean = values.filter((v) => Number.isFinite(v) && v > 0);
  if (clean.length === 0) return 0;
  const sorted = [...clean].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(values: number[]): number {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return 0;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

/** Peer-set median multiples (robust to outliers) used for relative valuation. */
export function peerMedians(peers: CompRow[]): CompStats {
  return {
    peRatio: median(peers.map((p) => p.peRatio)),
    pbvRatio: median(peers.map((p) => p.pbvRatio)),
    evEbitda: median(peers.map((p) => p.evEbitda)),
    roe: mean(peers.map((p) => p.roe)),
    revenueGrowth: mean(peers.map((p) => p.revenueGrowth)),
  };
}
