import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact currency formatter (e.g. Rp 1.2T, $4.5B). */
export function formatCurrency(
  value: number,
  currency = "IDR",
  opts: { compact?: boolean } = {},
): string {
  const { compact = true } = opts;
  const symbol = currency === "IDR" ? "Rp" : currency === "USD" ? "$" : "";
  const abs = Math.abs(value);

  if (compact) {
    const sign = value < 0 ? "-" : "";
    if (abs >= 1e12) return `${sign}${symbol}${(abs / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(2)}K`;
  }
  return `${symbol}${value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

/** Price formatter — full precision for share prices. */
export function formatPrice(value: number, currency = "IDR"): string {
  const symbol = currency === "IDR" ? "Rp" : currency === "USD" ? "$" : "";
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(value: number, digits = 2): string {
  return `${value >= 0 ? "" : ""}${value.toFixed(digits)}%`;
}

export function formatNumber(value: number, digits = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  });
}

/** Percentage change between two values. */
export function pctChange(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

export function changeColor(value: number): string {
  if (value > 0) return "text-bull";
  if (value < 0) return "text-bear";
  return "text-muted-foreground";
}
