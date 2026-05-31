import Link from "next/link";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChange } from "@/components/price-change";
import { listCompanies } from "@/server/companies";
import { formatPrice } from "@/lib/utils";

export async function MarketOverview() {
  const companies = (await listCompanies()).slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" /> Market Overview
        </CardTitle>
        <Link href="/companies" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {companies.map((c) => (
          <Link
            key={c.ticker}
            href={`/company/${c.ticker}`}
            className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-secondary"
          >
            <div className="min-w-0">
              <span className="font-mono text-sm font-semibold">{c.ticker}</span>
              <span className="ml-2 truncate text-xs text-muted-foreground">
                {c.sector}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="tabular text-sm">{formatPrice(c.price, c.currency)}</span>
              <span className="w-16 text-right">
                <PriceChange changePct={c.dayChangePct} showIcon={false} />
              </span>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
