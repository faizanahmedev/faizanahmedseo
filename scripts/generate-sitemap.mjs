// Rebuilds public/sitemap.xml on every deploy. Add a page (a folder with an index.html) and it appears automatically.
// Skipped: pages with a noindex robots tag, meta-refresh redirects, and 404.html (it is not an index.html).
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ORIGIN = "https://www.faizanahmedseo.com"; // preferred version: www
const ROOT = "public";
const SKIP = new Set(["assets", "images", "icons", "og"]);
const urls = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { if (!SKIP.has(name)) walk(p); continue; }
    if (name !== "index.html") continue;
    const html = readFileSync(p, "utf8");
    if (/<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html) || /http-equiv=["']refresh["']/i.test(html)) continue;
    const folder = relative(ROOT, dir).split(sep).join("/");
    urls.push({ loc: ORIGIN + (folder ? "/" + folder : "/"), lastmod: statSync(p).mtime.toISOString().slice(0, 10) });
  }
}
walk(ROOT);
urls.sort((a, b) => a.loc.length - b.loc.length);
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n") + `\n</urlset>\n`;
writeFileSync(join(ROOT, "sitemap.xml"), xml);
console.log(`sitemap.xml written with ${urls.length} URL(s)`);
