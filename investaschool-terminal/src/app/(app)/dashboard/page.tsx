import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MarketOverview } from "@/components/dashboard/market-overview";
import { WatchlistWidget } from "@/components/dashboard/watchlist-widget";
import { RecentResearch } from "@/components/dashboard/recent-research";
import { ValuationSummary } from "@/components/dashboard/valuation-summary";
import { PortfolioSnapshot } from "@/components/dashboard/portfolio-snapshot";

export const dynamic = "force-dynamic";

function WidgetSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await currentUser();
  const name = user?.firstName ?? "Analyst";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {name}</h1>
        <p className="text-sm text-muted-foreground">
          Your research terminal at a glance.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<WidgetSkeleton />}>
          <MarketOverview />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <PortfolioSnapshot />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <WatchlistWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <ValuationSummary />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton />}>
          <RecentResearch />
        </Suspense>
      </div>
    </div>
  );
}
