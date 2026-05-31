import Link from "next/link";
import { FileText, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingBadge } from "@/components/rating-badge";
import { EmptyState } from "@/components/empty-state";
import { ResearchGenerator } from "@/components/research/research-generator";
import { listReports } from "@/server/research";
import { listCompanies } from "@/server/companies";
import { formatPrice } from "@/lib/utils";
import type { Rating } from "@/types";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const [reports, companies] = await Promise.all([listReports(), listCompanies()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Research</h1>
        <p className="text-sm text-muted-foreground">
          Generate institutional-style equity research reports.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2 pb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchGenerator
            companies={companies.map((c) => ({ ticker: c.ticker, name: c.name }))}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Recent Reports
        </h2>
        {reports.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No reports yet"
            description="Generate your first AI research report by selecting a company above."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {reports.map((r) => (
              <Link key={r.id} href={`/research/${r.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{r.company.ticker}</span>
                          <RatingBadge rating={r.rating as Rating} />
                        </div>
                        <p className="mt-1 truncate text-sm text-muted-foreground">
                          {r.title}
                        </p>
                      </div>
                      {r.targetPrice != null && (
                        <span className="tabular shrink-0 text-sm font-medium">
                          {formatPrice(r.targetPrice, r.company.currency)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {r.model === "template-fallback" ? "Template" : r.model}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
