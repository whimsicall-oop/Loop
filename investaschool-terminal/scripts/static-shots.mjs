import pw from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pw;

const BASE = "http://127.0.0.1:3000";
const OUT = "/tmp/shots";

const pages = [
  { name: "1-landing", path: "/" },
  { name: "2-dashboard", path: "/dashboard" },
  { name: "3-company-overview", path: "/company/BBCA" },
  { name: "4-valuation", path: "/valuation?ticker=BBCA" },
  { name: "5-research-list", path: "/research" },
  { name: "6-portfolio", path: "/portfolio" },
  { name: "7-watchlist", path: "/watchlist" },
  { name: "8-search", path: "/search?q=ban" },
];

async function fetchInlined(path) {
  const html = await (await fetch(BASE + path)).text();
  // Collect CSS hrefs from <link rel="stylesheet">
  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  let css = "";
  for (const h of hrefs) {
    try {
      css += await (await fetch(BASE + h)).text() + "\n";
    } catch {}
  }
  // Drop ONLY external <script src> (no network); keep React's inline
  // streaming-swap scripts so suspended content gets revealed offline.
  let body = html
    .replace(/<script[^>]*\bsrc=("|')[^"']*\1[^>]*>\s*<\/script>/g, "")
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, "");
  return `<!doctype html><html class="dark"><head><meta charset="utf-8">
    <style>${css}</style>
    <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif!important}
    *{font-family:inherit!important}</style>
    </head>${body.slice(body.indexOf("<body"))}`;
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
// Block any network the page tries (fonts/images) so it never hangs.
await page.route("**/*", (route) => route.abort());

for (const p of pages) {
  const content = await fetchInlined(p.path);
  await page.setContent(content, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${p.name}.png`, fullPage: true });
  console.log("captured", p.name);
}

await browser.close();
console.log("done");
