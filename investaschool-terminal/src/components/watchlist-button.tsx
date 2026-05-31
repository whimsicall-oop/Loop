"use client";

import * as React from "react";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleWatchlist } from "@/server/watchlist";
import { cn } from "@/lib/utils";

export function WatchlistButton({
  ticker,
  initialInList,
  variant = "outline",
}: {
  ticker: string;
  initialInList: boolean;
  variant?: "outline" | "default" | "ghost";
}) {
  const [inList, setInList] = React.useState(initialInList);
  const [pending, startTransition] = React.useTransition();

  function onClick() {
    startTransition(async () => {
      try {
        const next = await toggleWatchlist(ticker);
        setInList(next);
        toast.success(next ? `${ticker} added to watchlist` : `${ticker} removed`);
      } catch {
        toast.error("Could not update watchlist");
      }
    });
  }

  return (
    <Button variant={variant} onClick={onClick} disabled={pending}>
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star className={cn("h-4 w-4", inList && "fill-primary text-primary")} />
      )}
      {inList ? "In Watchlist" : "Add to Watchlist"}
    </Button>
  );
}
