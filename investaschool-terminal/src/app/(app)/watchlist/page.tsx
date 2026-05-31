import Link from "next/link";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { getWatchlist } from "@/server/watchlist";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const rows = await getWatchlist();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-sm text-muted-foreground">
          Track daily and weekly performance for the names you follow.
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Star}
          title="Your watchlist is empty"
          description="Add companies from any company page or the search results to track them here."
          action={
            <Button asChild>
              <Link href="/search">Find companies</Link>
            </Button>
          }
        />
      ) : (
        <WatchlistTable rows={rows} />
      )}
    </div>
  );
}
