/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import type { CompanyMetrics, FinancialYear, ResearchContent } from "@/types";

// Institutional-report palette (light, print-friendly).
const C = {
  ink: "#0f172a",
  sub: "#475569",
  line: "#e2e8f0",
  accent: "#0d9488",
  bull: "#16a34a",
  bear: "#dc2626",
  band: "#f1f5f9",
};

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 44, fontSize: 9, color: C.ink, fontFamily: "Helvetica" },
  band: { backgroundColor: C.accent, marginHorizontal: -44, marginTop: -48, paddingHorizontal: 44, paddingVertical: 18, marginBottom: 18 },
  brand: { color: "#d1fae5", fontSize: 8, letterSpacing: 2, textTransform: "uppercase" },
  title: { color: "#ffffff", fontSize: 18, fontFamily: "Helvetica-Bold", marginTop: 4 },
  subtitle: { color: "#ccfbf1", fontSize: 10, marginTop: 2 },
  ratingRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  ratingBox: { flexDirection: "row", gap: 18 },
  kv: {},
  kLabel: { fontSize: 7, color: C.sub, textTransform: "uppercase", letterSpacing: 1 },
  kValue: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 2 },
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: C.accent, textTransform: "uppercase", letterSpacing: 1, marginTop: 14, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 3 },
  para: { fontSize: 9, color: C.ink, lineHeight: 1.5, marginBottom: 4 },
  bullet: { flexDirection: "row", marginBottom: 2 },
  dot: { width: 8, fontSize: 9, color: C.accent },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.4 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  metricCell: { width: "25%", paddingVertical: 5 },
  swotRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  swotCol: { flex: 1, backgroundColor: C.band, padding: 8, borderRadius: 4 },
  swotHead: { fontSize: 8, fontFamily: "Helvetica-Bold", marginBottom: 3, textTransform: "uppercase" },
  // table
  tRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line },
  tHeadRow: { flexDirection: "row", backgroundColor: C.band },
  tCell: { flex: 1, padding: 4, fontSize: 8, textAlign: "right" },
  tCellL: { flex: 1.6, padding: 4, fontSize: 8, textAlign: "left" },
  tHead: { fontFamily: "Helvetica-Bold", color: C.sub },
  // bar chart
  chartRow: { flexDirection: "row", alignItems: "flex-end", height: 90, gap: 6, marginTop: 8, borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 2 },
  barWrap: { flex: 1, alignItems: "center" },
  barLabel: { fontSize: 6, color: C.sub, marginTop: 2 },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6, fontSize: 7, color: C.sub },
});

const fmt = (v: number, cur: string) => {
  const sym = cur === "IDR" ? "Rp" : "$";
  const a = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (a >= 1e12) return `${sign}${sym}${(a / 1e12).toFixed(2)}T`;
  if (a >= 1e9) return `${sign}${sym}${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}${sym}${(a / 1e6).toFixed(2)}M`;
  return `${sign}${sym}${a.toFixed(0)}`;
};
const price = (v: number, cur: string) =>
  `${cur === "IDR" ? "Rp" : "$"}${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

function Bullets({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((it, i) => (
        <View key={i} style={s.bullet}>
          <Text style={s.dot}>•</Text>
          <Text style={s.bulletText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

function RevenueBars({ financials, currency }: { financials: FinancialYear[]; currency: string }) {
  const max = Math.max(...financials.map((f) => f.revenue), 1);
  return (
    <View>
      <View style={s.chartRow}>
        {financials.map((f) => (
          <View key={f.fiscalYear} style={s.barWrap}>
            <View
              style={{
                width: 18,
                height: Math.max(2, (f.revenue / max) * 84),
                backgroundColor: C.accent,
                borderRadius: 2,
              }}
            />
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {financials.map((f) => (
          <Text key={f.fiscalYear} style={[s.barLabel, { flex: 1, textAlign: "center" }]}>
            FY{f.fiscalYear}
          </Text>
        ))}
      </View>
    </View>
  );
}

export interface ReportPdfProps {
  company: CompanyMetrics;
  financials: FinancialYear[];
  content: ResearchContent;
  valuation?: {
    fairValuePerShare: number;
    marginOfSafety: number;
    wacc: number;
    terminalGrowth: number;
  } | null;
  generatedAt: Date;
}

export function ReportDocument({ company, financials, content, valuation, generatedAt }: ReportPdfProps) {
  const cur = company.currency;
  const latest = financials[financials.length - 1];

  const metrics: Array<[string, string]> = [
    ["Price", price(company.price, cur)],
    ["Market Cap", fmt(company.marketCap, cur)],
    ["Enterprise Value", fmt(company.enterpriseValue, cur)],
    ["P/E", company.peRatio > 0 ? `${company.peRatio.toFixed(1)}x` : "n/m"],
    ["P/BV", `${company.pbvRatio.toFixed(1)}x`],
    ["EV/EBITDA", company.evEbitda > 0 ? `${company.evEbitda.toFixed(1)}x` : "n/m"],
    ["ROE", `${company.roe.toFixed(1)}%`],
    ["Dividend Yield", `${company.dividendYield.toFixed(2)}%`],
  ];

  return (
    <Document
      title={content.title}
      author="Investaschool Terminal"
      subject={`Equity research — ${company.ticker}`}
    >
      <Page size="A4" style={s.page}>
        {/* Banner */}
        <View style={s.band}>
          <Text style={s.brand}>Investaschool Terminal · Equity Research</Text>
          <Text style={s.title}>{content.title}</Text>
          <Text style={s.subtitle}>
            {company.ticker} · {company.name} · {company.exchange}
          </Text>
        </View>

        {/* Rating + targets */}
        <View style={s.ratingRow}>
          <View style={s.ratingBox}>
            <View style={s.kv}>
              <Text style={s.kLabel}>Rating</Text>
              <Text style={[s.kValue, { color: content.rating === "BUY" ? C.bull : content.rating === "SELL" ? C.bear : C.sub }]}>
                {content.rating}
              </Text>
            </View>
            <View style={s.kv}>
              <Text style={s.kLabel}>12-mo Target</Text>
              <Text style={s.kValue}>{content.targetPrice != null ? price(content.targetPrice, cur) : "—"}</Text>
            </View>
            <View style={s.kv}>
              <Text style={s.kLabel}>Current Price</Text>
              <Text style={s.kValue}>{price(company.price, cur)}</Text>
            </View>
            <View style={s.kv}>
              <Text style={s.kLabel}>Sector</Text>
              <Text style={[s.kValue, { fontSize: 9 }]}>{company.sector}</Text>
            </View>
          </View>
        </View>

        {/* Executive summary */}
        <Text style={s.sectionTitle}>Executive Summary</Text>
        <Text style={s.para}>{content.executiveSummary}</Text>

        {/* Company overview */}
        <Text style={s.sectionTitle}>Company Overview</Text>
        <Text style={s.para}>{content.businessOverview}</Text>

        {/* Key metrics */}
        <Text style={s.sectionTitle}>Key Metrics</Text>
        <View style={s.metricsGrid}>
          {metrics.map(([k, v]) => (
            <View key={k} style={s.metricCell}>
              <Text style={s.kLabel}>{k}</Text>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 1 }}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Financial analysis */}
        <Text style={s.sectionTitle}>Financial Analysis — Revenue Trend</Text>
        <RevenueBars financials={financials} currency={cur} />
        <View style={{ marginTop: 8 }}>
          <View style={s.tHeadRow}>
            <Text style={[s.tCellL, s.tHead]}>Metric ({cur})</Text>
            {financials.map((f) => (
              <Text key={f.fiscalYear} style={[s.tCell, s.tHead]}>FY{f.fiscalYear}</Text>
            ))}
          </View>
          {([
            ["Revenue", "revenue"],
            ["Net Income", "netIncome"],
            ["Free Cash Flow", "freeCashFlow"],
            ["Net Margin", "netMargin"],
          ] as const).map(([label, key]) => (
            <View key={key} style={s.tRow}>
              <Text style={s.tCellL}>{label}</Text>
              {financials.map((f) => (
                <Text key={f.fiscalYear} style={s.tCell}>
                  {key === "netMargin" ? `${(f[key] as number).toFixed(1)}%` : fmt(f[key] as number, cur)}
                </Text>
              ))}
            </View>
          ))}
        </View>

        <View style={s.footer} fixed>
          <Text>Investaschool Terminal — Educational sample data. Not investment advice.</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: thesis, risks, SWOT, valuation, conclusion */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionTitle}>Investment Thesis</Text>
        <Text style={s.para}>{content.investmentThesis}</Text>

        <Text style={s.sectionTitle}>Industry Outlook</Text>
        <Text style={s.para}>{content.industryOutlook}</Text>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Competitive Advantages</Text>
            <Bullets items={content.competitiveAdvantages} />
            <Text style={s.sectionTitle}>Opportunities</Text>
            <Bullets items={content.opportunities} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>Key Risks</Text>
            <Bullets items={content.risks} />
            <Text style={s.sectionTitle}>Key Catalysts</Text>
            <Bullets items={content.keyCatalysts} />
          </View>
        </View>

        <Text style={s.sectionTitle}>SWOT Analysis</Text>
        <View style={s.swotRow}>
          <View style={s.swotCol}>
            <Text style={[s.swotHead, { color: C.bull }]}>Strengths</Text>
            {content.swot.strengths.map((t, i) => <Text key={i} style={s.bulletText}>• {t}</Text>)}
          </View>
          <View style={s.swotCol}>
            <Text style={[s.swotHead, { color: C.bear }]}>Weaknesses</Text>
            {content.swot.weaknesses.map((t, i) => <Text key={i} style={s.bulletText}>• {t}</Text>)}
          </View>
        </View>
        <View style={[s.swotRow, { marginTop: 8 }]}>
          <View style={s.swotCol}>
            <Text style={[s.swotHead, { color: C.accent }]}>Opportunities</Text>
            {content.swot.opportunities.map((t, i) => <Text key={i} style={s.bulletText}>• {t}</Text>)}
          </View>
          <View style={s.swotCol}>
            <Text style={[s.swotHead, { color: "#b45309" }]}>Threats</Text>
            {content.swot.threats.map((t, i) => <Text key={i} style={s.bulletText}>• {t}</Text>)}
          </View>
        </View>

        {valuation && (
          <>
            <Text style={s.sectionTitle}>DCF Valuation</Text>
            <View style={s.metricsGrid}>
              {[
                ["Fair Value / Share", price(valuation.fairValuePerShare, cur)],
                ["Margin of Safety", `${valuation.marginOfSafety >= 0 ? "+" : ""}${valuation.marginOfSafety.toFixed(1)}%`],
                ["WACC", `${(valuation.wacc * 100).toFixed(2)}%`],
                ["Terminal Growth", `${(valuation.terminalGrowth * 100).toFixed(2)}%`],
              ].map(([k, v]) => (
                <View key={k} style={s.metricCell}>
                  <Text style={s.kLabel}>{k}</Text>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 1 }}>{v}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={s.sectionTitle}>Conclusion</Text>
        <Text style={s.para}>{content.conclusion}</Text>

        <Text style={[s.para, { marginTop: 10, fontSize: 7, color: C.sub }]}>
          Generated by Investaschool Terminal on {generatedAt.toLocaleDateString()} using{" "}
          {content.rating ? "structured analysis" : ""}. Figures are illustrative
          educational sample data and do not constitute investment advice.
        </Text>

        <View style={s.footer} fixed>
          <Text>Investaschool Terminal — Educational sample data. Not investment advice.</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
