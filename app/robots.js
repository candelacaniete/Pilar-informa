import { siteUrl } from '@/lib/utils'

export default function robots() {
  const base = siteUrl()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
