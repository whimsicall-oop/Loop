import { Badge } from "@/components/ui/badge";
import type { Rating } from "@/types";

export function RatingBadge({ rating }: { rating: Rating }) {
  const variant =
    rating === "BUY" ? "bull" : rating === "SELL" ? "bear" : "neutral";
  return <Badge variant={variant}>{rating}</Badge>;
}
