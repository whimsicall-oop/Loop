import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceChange } from "@/components/price-change";
import { formatCurrency, formatPrice } from "@/lib/utils";
import type { CompanyMetrics } from "@/types";

/** Reusable company list table used by Search and Companies pages. */
export function CompanyTable({ companies }: { companies: CompanyMetrics[] }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticker</TableHead>
            <TableHead>Company</TableHead>
            <TableHead className="hidden md:table-cell">Sector</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="hidden text-right sm:table-cell">Mkt Cap</TableHead>
            <TableHead className="hidden text-right lg:table-cell">P/E</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((c) => (
            <TableRow key={c.ticker} className="cursor-pointer">
              <TableCell className="font-mono font-semibold">
                <Link href={`/company/${c.ticker}`} className="hover:text-primary">
                  {c.ticker}
                </Link>
              </TableCell>
              <TableCell className="max-w-[220px] truncate">
                <Link href={`/company/${c.ticker}`}>{c.name}</Link>
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {c.sector}
              </TableCell>
              <TableCell className="tabular text-right">
                {formatPrice(c.price, c.currency)}
              </TableCell>
              <TableCell className="text-right">
                <PriceChange changePct={c.dayChangePct} showIcon={false} />
              </TableCell>
              <TableCell className="tabular hidden text-right text-muted-foreground sm:table-cell">
                {formatCurrency(c.marketCap, c.currency)}
              </TableCell>
              <TableCell className="tabular hidden text-right text-muted-foreground lg:table-cell">
                {c.peRatio > 0 ? c.peRatio.toFixed(1) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
