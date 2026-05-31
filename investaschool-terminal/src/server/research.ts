"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUser } from "@/server/auth";
import { getCompanyBundle } from "@/server/companies";
import { generateResearch } from "@/lib/ai/client";
import type { ResearchContent } from "@/types";

export interface ReportListItem {
  id: string;
  title: string;
  rating: string;
  targetPrice: number | null;
  model: string;
  createdAt: Date;
  company: { ticker: string; name: string; currency: string };
}

/** Generates a new AI research report for a ticker and persists it. */
export async function generateReport(ticker: string): Promise<string> {
  const user = await requireDbUser();
  const bundle = await getCompanyBundle(ticker);
  if (!bundle) throw new Error("Company not found");

  const { content, model } = await generateResearch(
    bundle.company,
    bundle.financials,
  );

  const company = await db.company.findUnique({ where: { ticker } });
  if (!company) throw new Error("Company not found");

  const report = await db.researchReport.create({
    data: {
      userId: user.id,
      companyId: company.id,
      title: content.title,
      rating: content.rating,
      targetPrice: content.targetPrice,
      sections: content as unknown as object,
      model,
    },
  });

  await db.researchHistory.create({
    data: {
      userId: user.id,
      companyId: company.id,
      action: "generate_report",
      model,
    },
  });

  revalidatePath("/research");
  revalidatePath(`/company/${ticker}`);
  return report.id;
}

export async function listReports(): Promise<ReportListItem[]> {
  const user = await requireDbUser();
  const reports = await db.researchReport.findMany({
    where: { userId: user.id },
    include: { company: true },
    orderBy: { createdAt: "desc" },
  });
  return reports.map((r) => ({
    id: r.id,
    title: r.title,
    rating: r.rating,
    targetPrice: r.targetPrice,
    model: r.model,
    createdAt: r.createdAt,
    company: {
      ticker: r.company.ticker,
      name: r.company.name,
      currency: r.company.currency,
    },
  }));
}

export interface FullReport {
  id: string;
  content: ResearchContent;
  model: string;
  createdAt: Date;
  company: { ticker: string; name: string; currency: string; price: number };
}

export async function getReport(id: string): Promise<FullReport | null> {
  const user = await requireDbUser();
  const report = await db.researchReport.findFirst({
    where: { id, userId: user.id },
    include: { company: true },
  });
  if (!report) return null;
  return {
    id: report.id,
    content: report.sections as unknown as ResearchContent,
    model: report.model,
    createdAt: report.createdAt,
    company: {
      ticker: report.company.ticker,
      name: report.company.name,
      currency: report.company.currency,
      price: report.company.price,
    },
  };
}

export async function deleteReport(id: string) {
  const user = await requireDbUser();
  await db.researchReport.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/research");
}
