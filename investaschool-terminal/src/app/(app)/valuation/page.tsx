import Link from "next/link";
import { Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { DcfCalculator } from "@/components/valuation/dcf-calculator";
import { getCompanyBundle, listCompanies } from "@/server/companies";
import { revenueCagr } from "@/lib/finance/ratios";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default async function ValuationPage({
  searchParams,
}: {
  searchParams: Promise<{ ticker?: string }>;
}) {
  const { ticker } = await searchParams;

  if (!ticker) {
    const companies = await listCompanies();
    return (
      <div className="space-y-6">
        <Header />
        <p className="text-sm text-muted-foreground">
          Select a company to build a discounted cash flow model.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <Link
              key={c.ticker}
              href={`/valuation?ticker=${c.ticker}`}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold">{c.ticker}</span>
                <span className="tabular text-sm">
                  {formatPrice(c.price, c.currency)}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const bundle = await getCompanyBundle(ticker);
  if (!bundle) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          icon={Calculator}
          title={`No company “${ticker}”`}
          description="Pick a valid ticker to model."
        />
      </div>
    );
  }

  const { company, financials } = bundle;
  const latest = financials[financials.length - 1];
  const baseFreeCashFlow = latest?.freeCashFlow ?? company.marketCap * 0.05;
  const netDebt = (latest?.totalDebt ?? 0) - (latest?.cash ?? 0);

  const series = financials.map((f) => ({
    fiscalYear: f.fiscalYear,
    revenue: f.revenue,
    netIncome: f.netIncome,
    freeCashFlow: f.freeCashFlow,
    totalEquity: f.totalEquity,
    totalAssets: f.totalAssets,
  }));

  const defaults = {
    revenueGrowth: clamp(Math.round(revenueCagr(series)), 0, 25),
    operatingMargin: clamp(Math.round(latest?.operatingMargin ?? 15), 0, 60),
    taxRate: 22,
    wacc: clamp(Math.round(8 + company.beta * 3), 6, 16),
    terminalGrowth: 3,
    projectionYears: 5,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Header />
        <Link
          href={`/company/${company.ticker}`}
          className="text-sm text-primary hover:underline"
        >
          {company.ticker} · {company.name}
        </Link>
      </div>

      {baseFreeCashFlow <= 0 && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Note: {company.ticker} has non-positive trailing free cash flow, so a
            standard DCF is less meaningful. The model still runs on your growth
            assumptions for educational purposes.
          </CardContent>
        </Card>
      )}

      <DcfCalculator
        ticker={company.ticker}
        currency={company.currency}
        baseFreeCashFlow={baseFreeCashFlow}
        netDebt={netDebt}
        sharesOutstanding={company.sharesOutstanding}
        currentPrice={company.price}
        defaults={defaults}
      />
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">DCF Valuation</h1>
      <p className="text-sm text-muted-foreground">
        Model intrinsic value with your own assumptions.
      </p>
    </div>
  );
}
