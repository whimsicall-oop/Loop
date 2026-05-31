"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/charts/trend-chart";
import type { FinancialYear } from "@/types";

export function FinancialCharts({
  financials,
  currency,
}: {
  financials: FinancialYear[];
  currency: string;
}) {
  const mk = (key: keyof FinancialYear) =>
    financials.map((f) => ({
      label: `FY${f.fiscalYear}`,
      value: f[key] as number,
    }));

  const charts: Array<{ title: string; key: keyof FinancialYear; color: string }> = [
    { title: "Revenue Trend", key: "revenue", color: "hsl(158 84% 44%)" },
    { title: "Net Income Trend", key: "netIncome", color: "hsl(199 89% 48%)" },
    { title: "Free Cash Flow Trend", key: "freeCashFlow", color: "hsl(43 96% 56%)" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {charts.map((c) => (
        <Card key={c.key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{c.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={mk(c.key)} color={c.color} currency={currency} height={200} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
