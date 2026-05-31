import Link from "next/link";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentValuations } from "@/server/valuation";
import { valuationVerdict } from "@/lib/finance/ratios";
import { formatPrice } from "@/lib/utils";

export async function ValuationSummary() {
  const valuations = await getRecentValuations();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calculator className="h-4 w-4 text-primary" /> Valuation Summary
        </CardTitle>
        <Link href="/valuation" className="text-xs text-primary hover:underline">
          New DCF
        </Link>
      </CardHeader>
      <CardContent>
        {valuations.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No saved valuations.{" "}
            <Link href="/valuation" className="text-primary">Build a DCF</Link>.
          </p>
        ) : (
          <div className="space-y-1">
            {valuations.map((v) => {
              const verdict = valuationVerdict(v.marginOfSafety);
              return (
                <Link
                  key={v.id}
                  href={`/company/${v.ticker}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-secondary"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold">{v.ticker}</span>
                    <Badge variant={verdict.tone}>{verdict.label}</Badge>
                  </div>
                  <div className="text-right">
                    <span className="tabular text-sm">
                      {formatPrice(v.fairValuePerShare, v.currency)}
                    </span>
                    <span
                      className={`ml-2 text-xs ${v.marginOfSafety >= 0 ? "text-bull" : "text-bear"}`}
                    >
                      {v.marginOfSafety >= 0 ? "+" : ""}
                      {v.marginOfSafety.toFixed(0)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
