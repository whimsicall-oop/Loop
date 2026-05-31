import OpenAI from "openai";
import type { CompanyMetrics, FinancialYear, ResearchContent } from "@/types";
import { systemPrompt, buildResearchPrompt } from "./prompts";
import { generateFallbackReport } from "./fallback";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** True when a real OpenAI key is configured. */
export function aiEnabled(): boolean {
  return Boolean(apiKey && apiKey.trim().length > 0);
}

const client = aiEnabled() ? new OpenAI({ apiKey }) : null;

export interface ResearchResult {
  content: ResearchContent;
  model: string;
}

/**
 * Generates a full research report. Uses OpenAI when configured; otherwise
 * falls back to the deterministic template engine. Any OpenAI error also
 * degrades gracefully to the fallback so the feature never hard-fails.
 */
export async function generateResearch(
  company: CompanyMetrics,
  financials: FinancialYear[],
): Promise<ResearchResult> {
  if (!client) {
    return {
      content: generateFallbackReport(company, financials),
      model: "template-fallback",
    };
  }

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: buildResearchPrompt(company, financials) },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty completion");
    const parsed = JSON.parse(raw) as Partial<ResearchContent>;

    // Merge over the fallback so any missing field is still populated.
    const base = generateFallbackReport(company, financials);
    const content: ResearchContent = {
      ...base,
      ...parsed,
      swot: { ...base.swot, ...(parsed.swot ?? {}) },
    };
    return { content, model };
  } catch (err) {
    console.error("[ai] OpenAI generation failed, using fallback:", err);
    return {
      content: generateFallbackReport(company, financials),
      model: "template-fallback",
    };
  }
}
