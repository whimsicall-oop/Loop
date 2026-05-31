"use client";

import * as React from "react";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarCompare } from "@/components/charts/bar-compare";
import { runDcf, buildSensitivity, type DcfInputs } from "@/lib/finance/dcf";
import { valuationVerdict } from "@/lib/finance/ratios";
import { saveValuation } from "@/server/valuation";
import { cn, formatPrice } from "@/lib/utils";

interface Assumptions {
  revenueGrowth: number; // %
  operatingMargin: number; // %
  taxRate: number; // %
  wacc: number; // %
  terminalGrowth: number; // %
  projectionYears: number;
}

const SLIDERS: Array<{
  key: keyof Assumptions;
  label: string;
  min: number;
  max: number;
  step: number;
  suffix: string;
}> = [
  { key: "revenueGrowth", label: "FCF / Revenue Growth", min: -10, max: 40, step: 0.5, suffix: "%" },
  { key: "operatingMargin", label: "Operating Margin", min: 0, max: 70, step: 0.5, suffix: "%" },
  { key: "taxRate", label: "Tax Rate", min: 0, max: 40, step: 0.5, suffix: "%" },
  { key: "wacc", label: "WACC (Discount Rate)", min: 4, max: 20, step: 0.25, suffix: "%" },
  { key: "terminalGrowth", label: "Terminal Growth", min: 0, max: 6, step: 0.25, suffix: "%" },
  { key: "projectionYears", label: "Projection Years", min: 3, max: 10, step: 1, suffix: "y" },
];

export function DcfCalculator({
  ticker,
  currency,
  baseFreeCashFlow,
  netDebt,
  sharesOutstanding,
  currentPrice,
  defaults,
}: {
  ticker: string;
  currency: string;
  baseFreeCashFlow: number;
  netDebt: number;
  sharesOutstanding: number;
  currentPrice: number;
  defaults: Assumptions;
}) {
  const [a, setA] = React.useState<Assumptions>(defaults);
  const [pending, startTransition] = React.useTransition();

  const inputs: DcfInputs = React.useMemo(
    () => ({
      baseFreeCashFlow,
      revenueGrowth: a.revenueGrowth / 100,
      operatingMargin: a.operatingMargin / 100,
      taxRate: a.taxRate / 100,
      wacc: a.wacc / 100,
      terminalGrowth: a.terminalGrowth / 100,
      projectionYears: a.projectionYears,
      netDebt,
      sharesOutstanding,
      currentPrice,
    }),
    [a, baseFreeCashFlow, netDebt, sharesOutstanding, currentPrice],
  );

  const result = React.useMemo(() => {
    try {
      return runDcf(inputs);
    } catch {
      return null;
    }
  }, [inputs]);

  const sensitivity = React.useMemo(() => {
    try {
      return buildSensitivity(inputs);
    } catch {
      return null;
    }
  }, [inputs]);

  const verdict = result ? valuationVerdict(result.marginOfSafety) : null;

  function save() {
    if (!result || !sensitivity) return;
    startTransition(async () => {
      try {
        await saveValuation({
          ticker,
          inputs: a,
          outputs: {
            intrinsicValue: result.intrinsicValue,
            fairValuePerShare: result.fairValuePerShare,
            currentPrice: result.currentPrice,
            marginOfSafety: result.marginOfSafety,
          },
          sensitivity,
        });
        toast.success("Valuation saved");
      } catch {
        toast.error("Could not save valuation");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Inputs */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {SLIDERS.map((s) => (
            <div key={s.key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="tabular font-medium">
                  {a[s.key]}
                  {s.suffix}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={a[s.key]}
                onChange={(e) =>
                  setA((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))
                }
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              />
            </div>
          ))}
          <Button onClick={save} disabled={pending || !result} className="w-full">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Valuation
          </Button>
        </CardContent>
      </Card>

      {/* Outputs */}
      <div className="space-y-6 lg:col-span-2">
        {!result ? (
          <Card>
            <CardContent className="p-6 text-sm text-bear">
              WACC must exceed the terminal growth rate for a finite valuation.
              Adjust the assumptions.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Output label="Fair Value / Share" value={formatPrice(result.fairValuePerShare, currency)} highlight />
              <Output label="Current Price" value={formatPrice(result.currentPrice, currency)} />
              <Output
                label="Margin of Safety"
                value={`${result.marginOfSafety >= 0 ? "+" : ""}${result.marginOfSafety.toFixed(1)}%`}
                tone={result.marginOfSafety >= 0 ? "bull" : "bear"}
              />
              <Output label="Intrinsic Equity Value" value={fmtShort(result.intrinsicValue, currency)} />
            </div>

            {verdict && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Verdict:</span>
                <Badge variant={verdict.tone}>{verdict.label}</Badge>
                <span className="text-muted-foreground">
                  vs. current {formatPrice(result.currentPrice, currency)}
                </span>
              </div>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fair Value vs Market Price</CardTitle>
              </CardHeader>
              <CardContent>
                <BarCompare
                  currency={currency}
                  data={[
                    { label: "Current Price", value: result.currentPrice },
                    { label: "Fair Value", value: Math.max(0, result.fairValuePerShare), highlight: true },
                  ]}
                />
              </CardContent>
            </Card>

            {sensitivity && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Sensitivity — Fair Value / Share
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <SensitivityTable
                    sensitivity={sensitivity}
                    currency={currency}
                    fair={result.fairValuePerShare}
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Rows: WACC · Columns: terminal growth. Center cell = your
                    current assumptions.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Output({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "bull" | "bear";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        highlight ? "border-primary/40 bg-primary/5" : "border-border bg-card",
      )}
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "tabular mt-1 text-lg font-semibold",
          tone === "bull" && "text-bull",
          tone === "bear" && "text-bear",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SensitivityTable({
  sensitivity,
  currency,
  fair,
}: {
  sensitivity: ReturnType<typeof buildSensitivity>;
  currency: string;
  fair: number;
}) {
  const cols = sensitivity[0];
  return (
    <table className="w-full border-collapse text-center text-xs">
      <thead>
        <tr>
          <th className="p-2 text-muted-foreground">WACC ＼ g</th>
          {cols.map((c, j) => (
            <th key={j} className="p-2 font-medium">
              {(c.terminalGrowth * 100).toFixed(2)}%
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sensitivity.map((row, i) => (
          <tr key={i}>
            <td className="p-2 font-medium text-muted-foreground">
              {(row[0].wacc * 100).toFixed(2)}%
            </td>
            {row.map((cell, j) => {
              const isCenter =
                i === Math.floor(sensitivity.length / 2) &&
                j === Math.floor(row.length / 2);
              const above = cell.fairValuePerShare >= fair;
              return (
                <td
                  key={j}
                  className={cn(
                    "tabular p-2",
                    isCenter && "rounded ring-1 ring-primary",
                    Number.isFinite(cell.fairValuePerShare)
                      ? above
                        ? "bg-bull/10 text-bull"
                        : "bg-bear/10 text-bear"
                      : "text-muted-foreground",
                  )}
                >
                  {Number.isFinite(cell.fairValuePerShare)
                    ? formatPrice(cell.fairValuePerShare, currency)
                    : "—"}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function fmtShort(v: number, currency: string): string {
  const symbol = currency === "IDR" ? "Rp" : "$";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${symbol}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(2)}M`;
  return `${sign}${symbol}${abs.toFixed(0)}`;
}
