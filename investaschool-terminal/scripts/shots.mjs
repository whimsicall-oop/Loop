import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pw;

const BASE = "http://127.0.0.1:3000";
const OUT = "/tmp/shots";
const shots = [
  { name: "1-landing", path: "/", full: true },
  { name: "2-dashboard", path: "/dashboard", full: true },
  { name: "3-company-overview", path: "/company/BBCA", full: true },
  { name: "4-company-financials", path: "/company/BBCA", full: true, tab: "Financials" },
  { name: "5-company-comparables", path: "/company/BBCA", full: true, tab: "Comparables" },
  { name: "6-valuation", path: "/valuation?ticker=BBCA", full: true },
  { name: "7-research-list", path: "/research", full: true },
  { name: "8-portfolio", path: "/portfolio", full: true },
  { name: "9-watchlist", path: "/watchlist", full: true },
  { name: "10-search", path: "/search?q=ban", full: true },
];

const browser = await chromium.launch({
  args: ["--no-sandbox", "--no-proxy-server", "--proxy-bypass-list=*"],
});
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

for (const s of shots) {
  await page.goto(BASE + s.path, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(1800); // let charts/RSC settle
  if (s.tab) {
    try {
      await page.getByRole("tab", { name: s.tab }).click();
      await page.waitForTimeout(900);
    } catch (e) {
      console.log("tab click failed", s.tab, e.message);
    }
  }
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log("captured", s.name);
}

// Open one research report detail
await page.goto(BASE + "/research", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(1200);
try {
  await page.locator('a[href^="/research/"]').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/11-research-report.png`, fullPage: true });
  console.log("captured 11-research-report");
} catch (e) {
  console.log("report open failed", e.message);
}

// Mobile view of dashboard
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const mp = await mctx.newPage();
await mp.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
await mp.waitForTimeout(1800);
await mp.screenshot({ path: `${OUT}/12-mobile-dashboard.png`, fullPage: true });
console.log("captured 12-mobile-dashboard");

await browser.close();
console.log("done");
