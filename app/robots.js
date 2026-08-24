import { siteUrl } from '@/lib/utils'

export default function robots() {
  const base = siteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/mapa', '/admin', '/admin/'],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
