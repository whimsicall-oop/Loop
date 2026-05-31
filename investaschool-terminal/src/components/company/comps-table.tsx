import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatCurrency } from "@/lib/utils";
import type { CompsResult } from "@/server/companies";

const fmt = (v: number, suffix = "x") =>
  v > 0 ? `${v.toFixed(1)}${suffix}` : "—";

export function CompsTable({ comps }: { comps: CompsResult }) {
  const { target, rows, medians } = comps;
  const currency = "IDR";

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead className="text-right">Mkt Cap</TableHead>
            <TableHead className="text-right">P/E</TableHead>
            <TableHead className="text-right">P/BV</TableHead>
            <TableHead className="text-right">EV/EBITDA</TableHead>
            <TableHead className="text-right">ROE</TableHead>
            <TableHead className="text-right">Rev. Growth</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="bg-primary/5">
            <TableCell className="font-semibold">
              {target.ticker}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                (target)
              </span>
            </TableCell>
            <TableCell className="tabular text-right">
              {formatCurrency(target.marketCap, currency)}
            </TableCell>
            <TableCell className="tabular text-right">{fmt(target.peRatio)}</TableCell>
            <TableCell className="tabular text-right">{fmt(target.pbvRatio)}</TableCell>
            <TableCell className="tabular text-right">{fmt(target.evEbitda)}</TableCell>
            <TableCell className="tabular text-right">{target.roe.toFixed(1)}%</TableCell>
            <TableCell className="tabular text-right">{target.revenueGrowth.toFixed(1)}%</TableCell>
          </TableRow>
          {rows.map((r) => (
            <TableRow key={r.ticker}>
              <TableCell className="font-mono">{r.ticker}</TableCell>
              <TableCell className="tabular text-right text-muted-foreground">
                {formatCurrency(r.marketCap, currency)}
              </TableCell>
              <TableCell className="tabular text-right">{fmt(r.peRatio)}</TableCell>
              <TableCell className="tabular text-right">{fmt(r.pbvRatio)}</TableCell>
              <TableCell className="tabular text-right">{fmt(r.evEbitda)}</TableCell>
              <TableCell className="tabular text-right">{r.roe.toFixed(1)}%</TableCell>
              <TableCell className="tabular text-right">{r.revenueGrowth.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t-2 border-border font-medium">
            <TableCell className="text-muted-foreground">Peer median</TableCell>
            <TableCell />
            <TableCell className={cn("tabular text-right")}>{fmt(medians.peRatio)}</TableCell>
            <TableCell className="tabular text-right">{fmt(medians.pbvRatio)}</TableCell>
            <TableCell className="tabular text-right">{fmt(medians.evEbitda)}</TableCell>
            <TableCell className="tabular text-right">{medians.roe.toFixed(1)}%</TableCell>
            <TableCell className="tabular text-right">{medians.revenueGrowth.toFixed(1)}%</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
