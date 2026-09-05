import {
  getNegociosActivos,
  getNoticias,
  getEventos,
  getCategorias,
  getMascotasAvisosPublicos,
} from '@/lib/data'
import { siteUrl } from '@/lib/utils'

export default async function sitemap() {
  const base = siteUrl()
  const [negocios, noticias, eventos, categorias, mascotas] = await Promise.all([
    getNegociosActivos(),
    getNoticias(),
    getEventos({ fromToday: false }),
    getCategorias(),
    getMascotasAvisosPublicos(),
  ])

  const legalPaths = new Set(['/privacidad', '/terminos', '/cookies'])
  const staticRoutes = [
    '',
    '/guia',
    '/noticias',
    '/agenda',
    '/promociones',
    '/farmacias',
    '/mascotas',
    '/emergencias',
    '/pilar',
    '/sumar-negocio',
    '/planes',
    '/privacidad',
    '/terminos',
    '/cookies',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'daily' : legalPaths.has(path) ? 'yearly' : 'weekly',
    priority: path === '' ? 1 : legalPaths.has(path) ? 0.3 : path === '/sumar-negocio' || path === '/planes' ? 0.7 : 0.8,
  }))

  const categoriaRoutes = categorias.map((c) => ({
    url: `${base}/categoria/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.75,
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

  const mascotaRoutes = mascotas.map((m) => ({
    url: `${base}/mascotas/${m.slug}`,
    lastModified: m.creado_en ? new Date(m.creado_en) : new Date(),
    changeFrequency: 'daily',
    priority: 0.65,
  }))

  return [
    ...staticRoutes,
    ...categoriaRoutes,
    ...negocioRoutes,
    ...noticiaRoutes,
    ...eventoRoutes,
    ...mascotaRoutes,
  ]
}
