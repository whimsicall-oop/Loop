/** Adds a sample AI report + DCF valuation for the demo user (for previews). */
import { PrismaClient } from "@prisma/client";
import { generateFallbackReport } from "../src/lib/ai/fallback";
import { runDcf, buildSensitivity, type DcfInputs } from "../src/lib/finance/dcf";

const db = new PrismaClient();

function toMetrics(c: any) {
  return {
    ...c,
    dayChange: c.price - c.previousClose,
    dayChangePct: ((c.price - c.previousClose) / c.previousClose) * 100,
  };
}

async function main() {
  const demo = await db.user.findUnique({ where: { clerkId: "demo_user_seed" } });
  if (!demo) throw new Error("Run db:seed first");

  for (const ticker of ["BBCA", "ICBP"]) {
    const c = await db.company.findUnique({
      where: { ticker },
      include: { financials: { orderBy: { fiscalYear: "asc" } } },
    });
    if (!c) continue;
    const company = toMetrics(c);
    const fins = c.financials;

    // Research report (deterministic fallback engine)
    const content = generateFallbackReport(company, fins as any);
    await db.researchReport.create({
      data: {
        userId: demo.id,
        companyId: c.id,
        title: content.title,
        rating: content.rating,
        targetPrice: content.targetPrice,
        sections: content as unknown as object,
        model: "template-fallback",
      },
    });

    // DCF valuation
    const latest = fins[fins.length - 1];
    const inputs: DcfInputs = {
      baseFreeCashFlow: latest.freeCashFlow,
      revenueGrowth: 0.09,
      operatingMargin: latest.operatingMargin / 100,
      taxRate: 0.22,
      wacc: 0.11,
      terminalGrowth: 0.03,
      projectionYears: 5,
      netDebt: latest.totalDebt - latest.cash,
      sharesOutstanding: c.sharesOutstanding,
      currentPrice: c.price,
    };
    const r = runDcf(inputs);
    await db.valuation.create({
      data: {
        userId: demo.id,
        companyId: c.id,
        revenueGrowth: 9,
        operatingMargin: latest.operatingMargin,
        taxRate: 22,
        wacc: 11,
        terminalGrowth: 3,
        projectionYears: 5,
        intrinsicValue: r.intrinsicValue,
        fairValuePerShare: r.fairValuePerShare,
        currentPrice: r.currentPrice,
        marginOfSafety: r.marginOfSafety,
        sensitivity: buildSensitivity(inputs) as unknown as object,
      },
    });
    console.log(`  ✓ demo report + valuation for ${ticker}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
