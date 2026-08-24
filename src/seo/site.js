export const BRAND = 'Guía Pilar'
export const BRAND_TAGLINE = 'Todo Pilar. En un solo lugar.'
export const DEFAULT_DESCRIPTION =
  'Guía Pilar — noticias, comercios, servicios, eventos y promociones de Pilar, Provincia de Buenos Aires.'
export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1200&q=80'
export const CONTACT_EMAIL = 'hola@pilarinforma.ar'
export const TITLE_SUFFIX = 'Guía Pilar'

export function getSiteUrl() {
  const envUrl =
    (typeof process !== 'undefined' &&
      process.env &&
      (process.env.SITE_URL ||
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : ''))) ||
    ''
  if (envUrl) return envUrl.replace(/\/$/, '')

  try {
    const viteUrl = import.meta.env?.VITE_SITE_URL
    if (viteUrl) return String(viteUrl).replace(/\/$/, '')
  } catch {
    // Edge Function no tiene import.meta.env de Vite
  }

  return 'https://guiapilar.ar'
}

export function absoluteUrl(path = '/') {
  const base = getSiteUrl()
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function pageTitle(title) {
  if (!title) return `${BRAND} — ${BRAND_TAGLINE}`
  if (title.includes(BRAND)) return title
  return `${title} · ${TITLE_SUFFIX}`
}
