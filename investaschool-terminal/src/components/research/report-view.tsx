import {
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RatingBadge } from "@/components/rating-badge";
import { formatPrice } from "@/lib/utils";
import type { ResearchContent } from "@/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReportView({
  content,
  currency,
}: {
  content: ResearchContent;
  currency: string;
}) {
  const swot: Array<{ key: keyof ResearchContent["swot"]; label: string; icon: typeof ShieldCheck; tone: string }> = [
    { key: "strengths", label: "Strengths", icon: ShieldCheck, tone: "text-bull" },
    { key: "weaknesses", label: "Weaknesses", icon: AlertTriangle, tone: "text-bear" },
    { key: "opportunities", label: "Opportunities", icon: TrendingUp, tone: "text-primary" },
    { key: "threats", label: "Threats", icon: Zap, tone: "text-amber-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Headline */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <RatingBadge rating={content.rating} />
            {content.targetPrice != null && (
              <div className="text-sm">
                <span className="text-muted-foreground">12-mo target: </span>
                <span className="tabular font-semibold">
                  {formatPrice(content.targetPrice, currency)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title="Executive Summary">{content.executiveSummary}</Section>
          <Section title="Business Overview">{content.businessOverview}</Section>
          <Section title="Investment Thesis">{content.investmentThesis}</Section>
          <Section title="Industry Outlook">{content.industryOutlook}</Section>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-3">
            <ShieldCheck className="h-4 w-4 text-bull" />
            <CardTitle className="text-base">Competitive Advantages</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <BulletList items={content.competitiveAdvantages} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-3">
            <Lightbulb className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <BulletList items={content.opportunities} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-3">
            <AlertTriangle className="h-4 w-4 text-bear" />
            <CardTitle className="text-base">Key Risks</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <BulletList items={content.risks} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-2 pb-3">
            <Zap className="h-4 w-4 text-amber-400" />
            <CardTitle className="text-base">Key Catalysts</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <BulletList items={content.keyCatalysts} />
          </CardContent>
        </Card>
      </div>

      {/* SWOT */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">SWOT Analysis</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {swot.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="rounded-lg border border-border bg-secondary/30 p-4">
              <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${tone}`}>
                <Icon className="h-4 w-4" />
                {label}
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {content.swot[key].map((it, i) => (
                  <li key={i}>• {it}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conclusion</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          {content.conclusion}
        </CardContent>
      </Card>
    </div>
  );
}
