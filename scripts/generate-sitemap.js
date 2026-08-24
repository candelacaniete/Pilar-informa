import { writeFileSync } from 'node:fs'
import { getSitemapEntries } from '../src/seo/lookup.js'

const body = getSitemapEntries()
  .map((entry) => `  <url>\n    <loc>${entry.url}</loc>\n  </url>`)
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml: ${getSitemapEntries().length} URLs`)
