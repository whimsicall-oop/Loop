import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChange } from "@/components/price-change";
import { getWatchlist } from "@/server/watchlist";
import { formatPrice } from "@/lib/utils";

export async function WatchlistWidget() {
  const rows = (await getWatchlist()).slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-primary" /> Watchlist
        </CardTitle>
        <Link href="/watchlist" className="text-xs text-primary hover:underline">
          Manage
        </Link>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No companies yet. <Link href="/search" className="text-primary">Add some</Link>.
          </p>
        ) : (
          <div className="space-y-1">
            {rows.map(({ company, itemId }) => (
              <Link
                key={itemId}
                href={`/company/${company.ticker}`}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-secondary"
              >
                <span className="font-mono text-sm font-semibold">{company.ticker}</span>
                <div className="flex items-center gap-3">
                  <span className="tabular text-sm">
                    {formatPrice(company.price, company.currency)}
                  </span>
                  <span className="w-16 text-right">
                    <PriceChange changePct={company.dayChangePct} showIcon={false} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
