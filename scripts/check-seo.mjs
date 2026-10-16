// SEO safety net. Runs on every deploy (see vercel.json). If any ERROR is found the build fails,
// so a page with a missing title / description / H1 / canonical can never go live by accident.
// Run it yourself with:  node scripts/check-seo.mjs
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ORIGIN = "https://www.faizanahmedseo.com";
const ROOT = "public";
const SKIP = new Set(["assets", "images", "icons", "og"]);
const errors = [], warns = [];
const err = (page, m) => errors.push(`${page}: ${m}`);
const warn = (page, m) => warns.push(`${page}: ${m}`);

const pages = [];
(function walk(dir) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) { if (!SKIP.has(n)) walk(p); }
    else if (n === "index.html") pages.push(p);
  }
})(ROOT);

const sitemap = existsSync(join(ROOT, "sitemap.xml")) ? readFileSync(join(ROOT, "sitemap.xml"), "utf8") : "";
if (!sitemap) err("sitemap.xml", "missing (run generate-sitemap first)");
if (!existsSync(join(ROOT, "robots.txt"))) err("robots.txt", "missing");
else {
  const r = readFileSync(join(ROOT, "robots.txt"), "utf8");
  if (/^\s*Disallow:\s*\/\s*$/im.test(r)) err("robots.txt", "contains 'Disallow: /' which blocks the whole site");
  if (!/^Sitemap:/im.test(r)) err("robots.txt", "no Sitemap line");
}
if (!existsSync(join(ROOT, "404.html"))) err("404.html", "missing");

const seenTitle = new Map(), seenDesc = new Map();
const attr = (tag, a) => (tag.match(new RegExp(`${a}=("([^"]*)"|'([^']*)')`, "i")) || [])[2] ?? (tag.match(new RegExp(`${a}=('([^']*)')`, "i")) || [])[2];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function fileForPath(p) {
  const clean = decodeURIComponent(p.split("#")[0].split("?")[0]);
  const c = [join(ROOT, clean), join(ROOT, clean, "index.html"), join(ROOT, clean + ".html")];
  return c.find((f) => existsSync(f) && statSync(f).isFile());
}

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const folder = relative(ROOT, file).split(sep).slice(0, -1).join("/");
  const path = folder ? "/" + folder : "/";
  const expected = ORIGIN + path;
  const pg = path;
  const meta = (name, kind = "name") => {
    const m = [...html.matchAll(/<meta\b[^>]*>/gi)].map((x) => x[0]).find((t) => (attr(t, kind) || "").toLowerCase() === name);
    return m ? decode(attr(m, "content") || "") : "";
  };
  if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html)) { warn(pg, "has noindex (page will be left out of the sitemap)"); continue; }

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "").trim();
  const desc = meta("description");
  const h1s = [...html.matchAll(/<h1\b/gi)].length;
  const canon = ((html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i) || [""])[0].match(/href="([^"]*)"/) || [])[1];
  if (!title) err(pg, "missing <title>"); else if (title.length < 50 || title.length > 60) warn(pg, `title is ${title.length} chars (aim 50-60)`);
  if (!desc) err(pg, "missing meta description"); else if (desc.length < 140 || desc.length > 160) warn(pg, `description is ${desc.length} chars (aim 140-160)`);
  if (h1s !== 1) err(pg, `needs exactly one <h1> (found ${h1s})`);
  if (!canon) err(pg, "missing canonical"); else if (canon !== expected) err(pg, `canonical is ${canon}, expected ${expected}`);
  if (title) { if (seenTitle.has(title)) err(pg, `same title as ${seenTitle.get(title)}`); seenTitle.set(title, pg); }
  if (desc) { if (seenDesc.has(desc)) err(pg, `same description as ${seenDesc.get(desc)}`); seenDesc.set(desc, pg); }
  if (!/<html[^>]+lang=/i.test(html)) err(pg, "missing <html lang>");
  if (!/<meta[^>]+name=["']viewport["']/i.test(html)) err(pg, "missing viewport meta");
  for (const k of ["og:title", "og:description", "og:image", "og:url"]) if (!meta(k, "property")) err(pg, `missing ${k}`);
  if (meta("og:url", "property") && meta("og:url", "property") !== expected) err(pg, "og:url does not match canonical");
  if (!meta("twitter:card")) err(pg, "missing twitter:card");
  const og = meta("og:image", "property");
  if (og.startsWith(ORIGIN) && !existsSync(join(ROOT, og.slice(ORIGIN.length)))) err(pg, `og:image file not found: ${og}`);
  if (sitemap && !sitemap.includes(`<loc>${expected}</loc>`)) err(pg, "not listed in sitemap.xml");

  // headings: one H1, then no skipped levels
  let prev = 0;
  for (const m of html.matchAll(/<h([1-6])\b/gi)) { const l = +m[1]; if (prev && l > prev + 1) err(pg, `heading jumps from h${prev} to h${l}`); if (!prev && l !== 1) err(pg, "first heading is not h1"); prev = l; }

  // structured data must be valid JSON
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) { try { JSON.parse(m[1]); } catch (e) { err(pg, "invalid JSON-LD: " + e.message); } }

  // images
  for (const t of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = t[0];
    if (!/\balt=/.test(tag)) err(pg, "image without alt: " + (attr(tag, "src") || "").slice(0, 60));
    if (!/\bwidth=/.test(tag) || !/\bheight=/.test(tag)) err(pg, "image without width/height: " + (attr(tag, "src") || "").slice(0, 60));
  }
  // links, scripts, stylesheets, images: broken or insecure
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/<(a|link|script|img)\b[^>]*>/gi)) {
    const tag = m[0], el = m[1].toLowerCase();
    const ref = el === "a" || el === "link" ? attr(tag, "href") : attr(tag, "src");
    if (ref === undefined) { if (el === "a") warn(pg, "<a> without href (not crawlable): " + tag.slice(0, 70)); continue; }
    if (/^http:\/\//i.test(ref)) { err(pg, "insecure http:// reference " + ref); continue; }
    if (/^(https:|mailto:|tel:|data:)/i.test(ref)) continue;
    if (ref === "#" || ref === "") { err(pg, 'empty link href="' + ref + '"'); continue; }
    if (ref.startsWith("#")) { if (ref !== "#top" && !ids.has(ref.slice(1))) err(pg, `anchor ${ref} has no matching id`); continue; }
    if (ref.startsWith("/") && !fileForPath(ref)) err(pg, `broken link/file: ${ref}`);
  }
}
if (!pages.length) err("site", "no pages found");
console.log(`Checked ${pages.length} page(s).`);
warns.forEach((w) => console.log("  warning  " + w));
errors.forEach((e) => console.log("  ERROR    " + e));
if (errors.length) { console.log(`\n${errors.length} error(s). Fix them before deploying.`); process.exit(1); }
console.log("All SEO checks passed.");
