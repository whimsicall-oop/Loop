import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricTile } from "@/components/metric-tile";
import { PriceChange } from "@/components/price-change";
import { EmptyState } from "@/components/empty-state";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { AllocationPie } from "@/components/charts/allocation-pie";
import { PerformanceChart, type PerfPoint } from "@/components/charts/performance-chart";
import { getPortfolio } from "@/server/portfolio";
import { syntheticHistory } from "@/lib/market";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const p = await getPortfolio();

  // Allocation: holdings by market value + cash sleeve.
  const allocation = [
    ...p.holdings.map((h) => ({ name: h.company.ticker, value: h.marketValue })),
    ...(p.cash > 0 ? [{ name: "Cash", value: p.cash }] : []),
  ];

  // 30-day portfolio value path from per-holding synthetic histories.
  const DAYS = 30;
  const perf: PerfPoint[] = [];
  if (p.holdings.length > 0) {
    const series = p.holdings.map((h) => ({
      shares: h.shares,
      history: syntheticHistory(h.company, DAYS),
    }));
    for (let i = 0; i < DAYS; i++) {
      const value =
        series.reduce((s, { shares, history }) => s + shares * history[i].price, 0) +
        p.cash;
      perf.push({ t: series[0].history[i].t, value });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{p.name}</h1>
          <p className="text-sm text-muted-foreground">
            Holdings, allocation, and total return.
          </p>
        </div>
        <AddHoldingDialog />
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Portfolio Value"
          value={formatCurrency(p.totalValue, "IDR")}
          sub={`${formatCurrency(p.cash, "IDR")} cash`}
        />
        <MetricTile
          label="Total Return"
          value={
            <span className={p.totalReturn >= 0 ? "text-bull" : "text-bear"}>
              {formatCurrency(p.totalReturn, "IDR")}
            </span>
          }
          sub={<PriceChange changePct={p.totalReturnPct} showIcon={false} />}
        />
        <MetricTile label="Market Value" value={formatCurrency(p.totalMarketValue, "IDR")} sub={`${p.holdings.length} positions`} />
        <MetricTile
          label="Day Change"
          value={
            <span className={p.dayChange >= 0 ? "text-bull" : "text-bear"}>
              {formatCurrency(p.dayChange, "IDR")}
            </span>
          }
          sub="Across holdings"
        />
      </div>

      {p.holdings.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No holdings yet"
          description="Add your first position to track allocation, returns, and performance."
          action={<AddHoldingDialog />}
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance (30d, synthetic)</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart data={perf} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <AllocationPie data={allocation} />
                <div className="mt-3 space-y-1">
                  {allocation.map((a) => (
                    <div key={a.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{a.name}</span>
                      <span className="tabular">
                        {((a.value / p.totalValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <HoldingsTable holdings={p.holdings} />
        </>
      )}
    </div>
  );
}
