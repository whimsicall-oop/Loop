import { renderToBuffer } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { currentDbUser } from "@/server/auth";
import { getCompanyBundle } from "@/server/companies";
import { ReportDocument } from "@/lib/pdf/report-document";
import type { ResearchContent } from "@/types";
import React from "react";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await currentDbUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const report = await db.researchReport.findFirst({
    where: { id, userId: user.id },
    include: { company: true },
  });
  if (!report) return new Response("Not found", { status: 404 });

  const bundle = await getCompanyBundle(report.company.ticker);
  if (!bundle) return new Response("Company data unavailable", { status: 404 });

  // Most recent saved valuation for this user + company, if any.
  const valuation = await db.valuation.findFirst({
    where: { userId: user.id, companyId: report.companyId },
    orderBy: { createdAt: "desc" },
  });

  const element = React.createElement(ReportDocument, {
    company: bundle.company,
    financials: bundle.financials,
    content: report.sections as unknown as ResearchContent,
    valuation: valuation
      ? {
          fairValuePerShare: valuation.fairValuePerShare,
          marginOfSafety: valuation.marginOfSafety,
          wacc: valuation.wacc,
          terminalGrowth: valuation.terminalGrowth,
        }
      : null,
    generatedAt: report.createdAt,
  });

  const buffer = await renderToBuffer(
    element as Parameters<typeof renderToBuffer>[0],
  );

  const filename = `${report.company.ticker}-research-${report.id.slice(0, 6)}.pdf`;
  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
