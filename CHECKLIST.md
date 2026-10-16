# Re-run after ANY change to the site (especially AI-generated changes)

1. Run `node scripts/generate-sitemap.mjs && node scripts/check-seo.mjs`. It must end with "All SEO checks passed." (Vercel runs this on every deploy and stops the deploy if it fails.)
2. Every page has ONE title (50-60 chars), ONE description (140-160 chars), ONE h1, and a canonical that is `https://www.faizanahmedseo.com/<path>`.
3. New page? Make a folder with an `index.html` (e.g. `public/about/index.html`). Copy the head tags from an existing page and change the title, description, canonical, og:url, og:image and JSON-LD. It joins the sitemap by itself.
4. Navigation uses real `<a href="/path">` links. No `onclick` navigation, no `href="#"`, no `#/hash` routes.
5. Every `<img>` has `alt`, `width` and `height`. Below-the-fold images have `loading="lazy"`. Use WebP.
6. Nothing in the project contains `noindex`, `Disallow: /`, or a `http://` asset link (the checker looks for these).
7. After deploying open `/robots.txt`, `/sitemap.xml`, a fake URL like `/nope` (must show the 404 page) and `http://faizanahmedseo.com` (must land on https://www...).
8. Test pages in Google's Rich Results Test and the Mobile-Friendly view, then Search Console > URL Inspection > Request indexing for any new page.
9. Never paste API keys or secrets into front-end files. Keys belong in Vercel / Supabase environment variables.
