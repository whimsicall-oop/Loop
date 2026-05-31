import pw from "/opt/node22/lib/node_modules/playwright/index.js";
import { readFileSync, writeFileSync } from "node:fs";
const { chromium } = pw;

const BASE = "http://127.0.0.1:3000";
const RID = readFileSync("/tmp/rid.txt", "utf8").trim();

const PAGES = [
  { id: "landing", label: "Home", path: "/" },
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "company", label: "Company", path: "/company/BBCA" },
  { id: "valuation", label: "Valuation", path: `/valuation?ticker=BBCA` },
  { id: "research", label: "Research", path: `/research/${RID}` },
  { id: "portfolio", label: "Portfolio", path: "/portfolio" },
  { id: "watchlist", label: "Watchlist", path: "/watchlist" },
];

async function inlined(path) {
  const html = await (await fetch(BASE + path)).text();
  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]);
  let css = "";
  for (const h of hrefs) {
    try { css += (await (await fetch(BASE + h)).text()) + "\n"; } catch {}
  }
  const body = html
    .replace(/<script[^>]*\bsrc=("|')[^"']*\1[^>]*>\s*<\/script>/g, "")
    .replace(/<link[^>]*rel="stylesheet"[^>]*>/g, "");
  const doc = `<!doctype html><html class="dark"><head><meta charset="utf-8"><style>${css}</style></head>${body.slice(body.indexOf("<body"))}`;
  return { doc, css };
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
const page = await ctx.newPage();
await page.route("**/*", (r) => r.abort());

let sharedCss = "";
const sections = [];
for (const p of PAGES) {
  const { doc, css } = await inlined(p.path);
  if (css.length > sharedCss.length) sharedCss = css;
  await page.setContent(doc, { waitUntil: "domcontentloaded", timeout: 15000 });
  await page.waitForTimeout(700); // run React streaming swap
  // Capture resolved body, drop scripts + hidden streaming templates.
  let inner = await page.evaluate(() => document.body.innerHTML);
  inner = inner
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<template[\s\S]*?<\/template>/g, "")
    .replace(/<div hidden[\s\S]*?<\/div>/g, "");
  sections.push(`<section class="ist-page" id="page-${p.id}"${sections.length ? ' hidden' : ""}>${inner}</section>`);
  console.log("rendered", p.id);
}
await browser.close();

const nav = PAGES.map(
  (p, i) => `<button class="ist-tab${i ? "" : " active"}" data-target="page-${p.id}">${p.label}</button>`,
).join("");

const out = `<!doctype html>
<html class="dark" lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Investaschool Terminal — Preview</title>
<style>${sharedCss}</style>
<style>
  html,body{margin:0;background:hsl(222 47% 6%);color:hsl(210 40% 96%)}
  .ist-nav{position:sticky;top:0;z-index:9999;display:flex;gap:4px;overflow-x:auto;
    padding:8px;background:hsl(222 44% 8%);border-bottom:1px solid hsl(217 33% 16%);
    -webkit-overflow-scrolling:touch}
  .ist-tab{flex:0 0 auto;border:1px solid hsl(217 33% 16%);background:transparent;
    color:hsl(215 20% 70%);padding:8px 14px;border-radius:8px;font-size:14px;
    font-family:ui-sans-serif,system-ui,sans-serif;font-weight:600}
  .ist-tab.active{background:hsl(158 84% 44%);color:hsl(222 47% 6%);border-color:transparent}
  .ist-banner{padding:8px 12px;font-size:12px;color:hsl(215 20% 60%);
    background:hsl(222 44% 8%);border-bottom:1px solid hsl(217 33% 16%);
    font-family:ui-sans-serif,system-ui,sans-serif}
  .ist-page{animation:fade .25s ease}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  /* Static preview: charts render client-side in the live app, so show a hint */
  .recharts-responsive-container::after{content:"📊 chart renders in the live app";
    display:flex;align-items:center;justify-content:center;height:100%;width:100%;
    color:hsl(215 20% 45%);font-size:12px;font-family:ui-sans-serif,system-ui,sans-serif}
</style>
</head>
<body>
<nav class="ist-nav">${nav}</nav>
<div class="ist-banner">Investaschool Terminal — static preview. Charts are interactive in the live app; sliders/search/auth need the server.</div>
${sections.join("\n")}
<script>
  document.querySelectorAll('.ist-tab').forEach(function(t){
    t.addEventListener('click',function(){
      document.querySelectorAll('.ist-tab').forEach(function(x){x.classList.remove('active')});
      document.querySelectorAll('.ist-page').forEach(function(s){s.hidden=true});
      t.classList.add('active');
      var el=document.getElementById(t.dataset.target);
      if(el){el.hidden=false;window.scrollTo(0,0);}
    });
  });
</script>
</body></html>`;

writeFileSync("/tmp/investaschool-preview.html", out);
console.log("wrote /tmp/investaschool-preview.html", (out.length / 1024).toFixed(0) + "KB");
