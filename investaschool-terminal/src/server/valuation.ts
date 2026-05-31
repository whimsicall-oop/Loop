"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUser } from "@/server/auth";
import type { DcfInputs, SensitivityCell } from "@/lib/finance/dcf";

export interface SaveValuationInput {
  ticker: string;
  inputs: Pick<
    DcfInputs,
    "revenueGrowth" | "operatingMargin" | "taxRate" | "wacc" | "terminalGrowth" | "projectionYears"
  >;
  outputs: {
    intrinsicValue: number;
    fairValuePerShare: number;
    currentPrice: number;
    marginOfSafety: number;
  };
  sensitivity: SensitivityCell[][];
}

export async function saveValuation(input: SaveValuationInput): Promise<string> {
  const user = await requireDbUser();
  const company = await db.company.findUnique({
    where: { ticker: input.ticker.toUpperCase() },
  });
  if (!company) throw new Error("Company not found");

  const v = await db.valuation.create({
    data: {
      userId: user.id,
      companyId: company.id,
      revenueGrowth: input.inputs.revenueGrowth,
      operatingMargin: input.inputs.operatingMargin,
      taxRate: input.inputs.taxRate,
      wacc: input.inputs.wacc,
      terminalGrowth: input.inputs.terminalGrowth,
      projectionYears: input.inputs.projectionYears,
      intrinsicValue: input.outputs.intrinsicValue,
      fairValuePerShare: input.outputs.fairValuePerShare,
      currentPrice: input.outputs.currentPrice,
      marginOfSafety: input.outputs.marginOfSafety,
      sensitivity: input.sensitivity as unknown as object,
    },
  });

  revalidatePath("/valuation");
  return v.id;
}
