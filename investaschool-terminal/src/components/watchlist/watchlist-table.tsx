"use client";

import * as React from "react";
import Link from "next/link";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PriceChange } from "@/components/price-change";
import { removeFromWatchlist } from "@/server/watchlist";
import { formatCurrency, formatPrice } from "@/lib/utils";
import type { WatchlistRow } from "@/server/watchlist";

export function WatchlistTable({ rows }: { rows: WatchlistRow[] }) {
  const [pendingTicker, setPendingTicker] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  function remove(ticker: string) {
    setPendingTicker(ticker);
    startTransition(async () => {
      try {
        await removeFromWatchlist(ticker);
        toast.success(`${ticker} removed from watchlist`);
      } catch {
        toast.error("Could not remove");
      } finally {
        setPendingTicker(null);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="hidden md:table-cell">Company</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Daily</TableHead>
            <TableHead className="text-right">Weekly</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Mkt Cap</TableHead>
            <TableHead className="hidden text-right lg:table-cell">P/E</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ company, weeklyChangePct, itemId }) => (
            <TableRow key={itemId}>
              <TableCell className="font-mono font-semibold">
                <Link href={`/company/${company.ticker}`} className="hover:text-primary">
                  {company.ticker}
                </Link>
              </TableCell>
              <TableCell className="hidden max-w-[200px] truncate text-muted-foreground md:table-cell">
                {company.name}
              </TableCell>
              <TableCell className="tabular text-right">
                {formatPrice(company.price, company.currency)}
              </TableCell>
              <TableCell className="text-right">
                <PriceChange changePct={company.dayChangePct} showIcon={false} />
              </TableCell>
              <TableCell className="text-right">
                <PriceChange changePct={weeklyChangePct} showIcon={false} />
              </TableCell>
              <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                {formatCurrency(company.marketCap, company.currency)}
              </TableCell>
              <TableCell className="tabular hidden text-right text-muted-foreground lg:table-cell">
                {company.peRatio > 0 ? company.peRatio.toFixed(1) : "—"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(company.ticker)}
                  disabled={pendingTicker === company.ticker}
                >
                  {pendingTicker === company.ticker ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
