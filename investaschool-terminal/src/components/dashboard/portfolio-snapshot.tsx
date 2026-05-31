import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceChange } from "@/components/price-change";
import { AllocationPie } from "@/components/charts/allocation-pie";
import { getPortfolio } from "@/server/portfolio";
import { formatCurrency } from "@/lib/utils";

export async function PortfolioSnapshot() {
  const p = await getPortfolio();
  const allocation = [
    ...p.holdings.map((h) => ({ name: h.company.ticker, value: h.marketValue })),
    ...(p.cash > 0 ? [{ name: "Cash", value: p.cash }] : []),
  ];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Briefcase className="h-4 w-4 text-primary" /> Portfolio Snapshot
        </CardTitle>
        <Link href="/portfolio" className="text-xs text-primary hover:underline">
          Open
        </Link>
      </CardHeader>
      <CardContent>
        {p.holdings.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No holdings yet.{" "}
            <Link href="/portfolio" className="text-primary">Add positions</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-2 items-center gap-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="tabular text-lg font-semibold">
                  {formatCurrency(p.totalValue, "IDR")}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Return</p>
                <PriceChange changePct={p.totalReturnPct} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Positions</p>
                <p className="tabular text-sm font-medium">{p.holdings.length}</p>
              </div>
            </div>
            <AllocationPie data={allocation} height={150} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
