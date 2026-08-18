import { getNegociosActivos, getNoticias, getEventos } from '@/lib/data'
import { siteUrl } from '@/lib/utils'

export default async function sitemap() {
  const base = siteUrl()
  const [negocios, noticias, eventos] = await Promise.all([
    getNegociosActivos(),
    getNoticias(),
    getEventos({ fromToday: false }),
  ])

  const staticRoutes = [
    '',
    '/guia',
    '/noticias',
    '/agenda',
    '/promociones',
    '/farmacias',
    '/pilar',
    '/mapa',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }))

  const negocioRoutes = negocios.map((n) => ({
    url: `${base}/negocio/${n.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const noticiaRoutes = noticias.map((n) => ({
    url: `${base}/noticias/${n.slug}`,
    lastModified: n.publicado_en ? new Date(n.publicado_en) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const eventoRoutes = eventos.map((e) => ({
    url: `${base}/eventos/${e.slug}`,
    lastModified: e.fecha ? new Date(e.fecha) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...negocioRoutes, ...noticiaRoutes, ...eventoRoutes]
}
