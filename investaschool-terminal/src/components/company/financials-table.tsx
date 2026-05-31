import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { FinancialYear } from "@/types";

const ROWS: Array<{ label: string; key: keyof FinancialYear; pct?: boolean }> = [
  { label: "Revenue", key: "revenue" },
  { label: "Gross Profit", key: "grossProfit" },
  { label: "Operating Income", key: "operatingIncome" },
  { label: "EBITDA", key: "ebitda" },
  { label: "Net Income", key: "netIncome" },
  { label: "Operating Cash Flow", key: "operatingCashFlow" },
  { label: "Free Cash Flow", key: "freeCashFlow" },
  { label: "Total Assets", key: "totalAssets" },
  { label: "Total Equity", key: "totalEquity" },
  { label: "Total Debt", key: "totalDebt" },
  { label: "Gross Margin", key: "grossMargin", pct: true },
  { label: "Operating Margin", key: "operatingMargin", pct: true },
  { label: "Net Margin", key: "netMargin", pct: true },
];

export function FinancialsTable({
  financials,
  currency,
}: {
  financials: FinancialYear[];
  currency: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric ({currency})</TableHead>
            {financials.map((f) => (
              <TableHead key={f.fiscalYear} className="text-right">
                FY{f.fiscalYear}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="font-medium">{row.label}</TableCell>
              {financials.map((f) => {
                const v = f[row.key] as number;
                return (
                  <TableCell key={f.fiscalYear} className="tabular text-right">
                    {row.pct
                      ? `${v.toFixed(1)}%`
                      : formatCurrency(v, currency)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
