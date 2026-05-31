import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PriceChange({
  changePct,
  changeAbs,
  currency,
  showIcon = true,
  className,
}: {
  changePct: number;
  changeAbs?: number;
  currency?: string;
  showIcon?: boolean;
  className?: string;
}) {
  const up = changePct >= 0;
  const symbol = currency === "IDR" ? "Rp" : currency === "USD" ? "$" : "";
  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-1 text-sm font-medium",
        up ? "text-bull" : "text-bear",
        className,
      )}
    >
      {showIcon &&
        (up ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        ))}
      {up ? "+" : ""}
      {changeAbs != null
        ? `${symbol}${Math.abs(changeAbs).toLocaleString("en-US", { maximumFractionDigits: 2 })} `
        : ""}
      ({up ? "+" : ""}
      {changePct.toFixed(2)}%)
    </span>
  );
}
