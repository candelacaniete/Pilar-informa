import { BRAND } from './site.js'

export function renderShareHtml(share) {
  const title = escapeHtml(share.title)
  const description = escapeHtml(share.description)
  const image = escapeHtml(share.image)
  const url = escapeHtml(share.url)
  const ogType = escapeHtml(share.ogType || 'website')

  return `<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:locale" content="es_AR" />
    <meta property="og:site_name" content="${escapeHtml(BRAND)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${url}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${image}" />
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
  </body>
</html>`
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
