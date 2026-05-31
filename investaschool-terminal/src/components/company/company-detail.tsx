"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialCharts } from "./financial-charts";
import { FinancialsTable } from "./financials-table";
import { CompsTable } from "./comps-table";
import { MetricTile } from "@/components/metric-tile";
import { EmptyState } from "@/components/empty-state";
import { revenueCagr, earningsCagr } from "@/lib/finance/ratios";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import type { CompanyMetrics, FinancialYear } from "@/types";
import type { CompsResult } from "@/server/companies";

export function CompanyDetail({
  company,
  financials,
  comps,
}: {
  company: CompanyMetrics;
  financials: FinancialYear[];
  comps: CompsResult | null;
}) {
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

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="financials">Financials</TabsTrigger>
        <TabsTrigger value="comparables">Comparables</TabsTrigger>
      </TabsList>

      {/* OVERVIEW */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Company Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <p>{company.description}</p>
              <div>
                <p className="mb-1 font-medium text-foreground">Business Model</p>
                <p>{company.businessModel}</p>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 text-xs">
                <span>
                  <span className="text-muted-foreground">Sector: </span>
                  <span className="font-medium text-foreground">{company.sector}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Industry: </span>
                  <span className="font-medium text-foreground">{company.industry}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Exchange: </span>
                  <span className="font-medium text-foreground">{company.exchange}</span>
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Financial Performance</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <PerfStat label="Revenue Growth" value={`${revCagr.toFixed(1)}%`} pos={revCagr >= 0} sub="5y CAGR" />
              <PerfStat label="Earnings Growth" value={`${epsCagr.toFixed(1)}%`} pos={epsCagr >= 0} sub="5y CAGR" />
              <PerfStat label="Gross Margin" value={`${latest?.grossMargin.toFixed(1)}%`} pos sub={`FY${latest?.fiscalYear}`} />
              <PerfStat label="Net Margin" value={`${latest?.netMargin.toFixed(1)}%`} pos={(latest?.netMargin ?? 0) >= 0} sub={`FY${latest?.fiscalYear}`} />
              <PerfStat label="Op. Cash Flow" value={fmtShort(latest?.operatingCashFlow ?? 0)} pos={(latest?.operatingCashFlow ?? 0) >= 0} sub={`FY${latest?.fiscalYear}`} />
              <PerfStat label="Free Cash Flow" value={fmtShort(latest?.freeCashFlow ?? 0)} pos={(latest?.freeCashFlow ?? 0) >= 0} sub={`FY${latest?.fiscalYear}`} />
            </CardContent>
          </Card>
        </div>

        {/* Key valuation metrics */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <MetricTile label="Market Cap" value={fmtShort(company.marketCap)} />
          <MetricTile label="Enterprise Value" value={fmtShort(company.enterpriseValue)} />
          <MetricTile label="P/E" value={company.peRatio > 0 ? `${company.peRatio.toFixed(1)}x` : "—"} />
          <MetricTile label="P/BV" value={`${company.pbvRatio.toFixed(1)}x`} />
          <MetricTile label="ROE" value={`${company.roe.toFixed(1)}%`} />
          <MetricTile label="ROA" value={`${company.roa.toFixed(1)}%`} />
          <MetricTile label="EV/EBITDA" value={company.evEbitda > 0 ? `${company.evEbitda.toFixed(1)}x` : "—"} />
          <MetricTile label="Dividend Yield" value={`${company.dividendYield.toFixed(2)}%`} />
          <MetricTile label="Beta" value={company.beta.toFixed(2)} />
          <MetricTile label="Revenue (FY)" value={fmtShort(latest?.revenue ?? 0)} />
          <MetricTile label="Net Income (FY)" value={fmtShort(latest?.netIncome ?? 0)} />
          <MetricTile label="EPS (FY)" value={(latest?.eps ?? 0).toFixed(2)} />
        </div>

        <FinancialCharts financials={financials} currency={company.currency} />
      </TabsContent>

      {/* FINANCIALS */}
      <TabsContent value="financials" className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {financials.length}-year historical financials (FY
          {financials[0]?.fiscalYear}–FY{latest?.fiscalYear}).
        </p>
        <FinancialsTable financials={financials} currency={company.currency} />
      </TabsContent>

      {/* COMPARABLES */}
      <TabsContent value="comparables" className="space-y-4">
        {comps && comps.rows.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Auto-discovered peers in {company.sector}, ranked by market-cap
              proximity.
            </p>
            <CompsTable comps={comps} />
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="No peers found"
            description="There are no comparable companies in the sample set for this sector yet."
          />
        )}
      </TabsContent>
    </Tabs>
  );
}

function PerfStat({
  label,
  value,
  sub,
  pos,
}: {
  label: string;
  value: string;
  sub: string;
  pos: boolean;
}) {
  return (
    <div className="rounded-md bg-secondary/50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={cn("tabular mt-0.5 font-semibold", pos ? "text-bull" : "text-bear")}>
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function fmtShort(v: number): string {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}Rp${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}Rp${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}Rp${(abs / 1e6).toFixed(2)}M`;
  return `${sign}Rp${abs.toFixed(0)}`;
}
