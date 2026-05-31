"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface AllocationDatum {
  name: string;
  value: number;
}

const COLORS = [
  "hsl(158 84% 44%)",
  "hsl(199 89% 48%)",
  "hsl(43 96% 56%)",
  "hsl(280 65% 60%)",
  "hsl(0 84% 64%)",
  "hsl(220 9% 55%)",
];

export function AllocationPie({
  data,
  currency = "IDR",
  height = 240,
}: {
  data: AllocationDatum[];
  currency?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          stroke="hsl(var(--card))"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v: number, n: string) => [formatCurrency(v, currency), n]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { COLORS as ALLOCATION_COLORS };
