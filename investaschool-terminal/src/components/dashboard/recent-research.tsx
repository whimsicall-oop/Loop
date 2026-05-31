import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingBadge } from "@/components/rating-badge";
import { listReports } from "@/server/research";
import type { Rating } from "@/types";

export async function RecentResearch() {
  const reports = (await listReports()).slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" /> Recent Research
        </CardTitle>
        <Link href="/research" className="text-xs text-primary hover:underline">
          All reports
        </Link>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No reports yet.{" "}
            <Link href="/research" className="text-primary">Generate one</Link>.
          </p>
        ) : (
          <div className="space-y-1">
            {reports.map((r) => (
              <Link
                key={r.id}
                href={`/research/${r.id}`}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-secondary"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{r.company.ticker}</span>
                  <span className="truncate text-xs text-muted-foreground">{r.company.name}</span>
                </div>
                <RatingBadge rating={r.rating as Rating} />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
