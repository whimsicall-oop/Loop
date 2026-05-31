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
import { removeHolding } from "@/server/portfolio";
import { formatCurrency, formatNumber, formatPrice } from "@/lib/utils";
import type { HoldingRow } from "@/server/portfolio";

export function HoldingsTable({ holdings }: { holdings: HoldingRow[] }) {
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [, startTransition] = React.useTransition();

  function remove(id: string) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await removeHolding(id);
        toast.success("Holding removed");
      } catch {
        toast.error("Could not remove holding");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Shares</TableHead>
            <TableHead className="text-right">Avg Cost</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Mkt Value</TableHead>
            <TableHead className="text-right">Unrealized P/L</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Weight</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((h) => (
            <TableRow key={h.id}>
              <TableCell className="font-mono font-semibold">
                <Link href={`/company/${h.company.ticker}`} className="hover:text-primary">
                  {h.company.ticker}
                </Link>
              </TableCell>
              <TableCell className="tabular text-right">{formatNumber(h.shares, 0)}</TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {formatPrice(h.avgCost, h.company.currency)}
              </TableCell>
              <TableCell className="tabular text-right">
                {formatPrice(h.company.price, h.company.currency)}
              </TableCell>
              <TableCell className="tabular text-right">
                {formatCurrency(h.marketValue, h.company.currency)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                  <span className={h.unrealizedPnl >= 0 ? "text-bull" : "text-bear"}>
                    {formatCurrency(h.unrealizedPnl, h.company.currency)}
                  </span>
                  <PriceChange changePct={h.unrealizedPnlPct} showIcon={false} className="text-xs" />
                </div>
              </TableCell>
              <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                {h.weight.toFixed(1)}%
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => remove(h.id)}
                  disabled={pendingId === h.id}
                >
                  {pendingId === h.id ? (
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
