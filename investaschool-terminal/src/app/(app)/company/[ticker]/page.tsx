import Link from "next/link";
import { notFound } from "next/navigation";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceChange } from "@/components/price-change";
import { WatchlistButton } from "@/components/watchlist-button";
import { GenerateReportButton } from "@/components/research/generate-report-button";
import { CompanyDetail } from "@/components/company/company-detail";
import { getCompanyBundle, getComps } from "@/server/companies";
import { isInWatchlist } from "@/server/watchlist";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker: raw } = await params;
  const ticker = raw.toUpperCase();

  const bundle = await getCompanyBundle(ticker);
  if (!bundle) notFound();

  const [comps, inWatchlist] = await Promise.all([
    getComps(ticker),
    isInWatchlist(ticker),
  ]);
  const { company, financials } = bundle;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight">
              {company.ticker}
            </h1>
            <Badge variant="secondary">{company.exchange}</Badge>
            <Badge variant="outline">{company.sector}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{company.name}</p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="tabular text-3xl font-bold">
              {formatPrice(company.price, company.currency)}
            </span>
            <PriceChange
              changePct={company.dayChangePct}
              changeAbs={company.dayChange}
              currency={company.currency}
            />
            <span className="text-xs text-muted-foreground">today</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <WatchlistButton ticker={company.ticker} initialInList={inWatchlist} />
          <Button asChild variant="outline">
            <Link href={`/valuation?ticker=${company.ticker}`}>
              <Calculator className="h-4 w-4" /> DCF Valuation
            </Link>
          </Button>
          <GenerateReportButton ticker={company.ticker} />
        </div>
      </div>

      <CompanyDetail company={company} financials={financials} comps={comps} />
    </div>
  );
}
