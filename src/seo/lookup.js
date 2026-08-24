import { businesses } from '../data/businesses.js'
import { categoryPages } from '../data/categories.js'
import { events } from '../data/events.js'
import { news } from '../data/news.js'
import { absoluteUrl, BRAND, BRAND_TAGLINE, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, pageTitle } from './site.js'

export function getBrandShare(path = '/') {
  return {
    found: path === '/',
    type: 'brand',
    ogType: 'website',
    title: pageTitle(`${BRAND} — ${BRAND_TAGLINE}`),
    description: DEFAULT_DESCRIPTION,
    image: DEFAULT_IMAGE,
    path,
    url: absoluteUrl(path),
  }
}

function fromCategory(category) {
  return {
    found: true,
    type: 'categoria',
    ogType: 'website',
    title: pageTitle(category.shareTitle),
    description: category.description,
    image: category.image,
    path: `/categoria/${category.slug}`,
    url: absoluteUrl(`/categoria/${category.slug}`),
    entity: category,
  }
}

function fromBusiness(business) {
  return {
    found: true,
    type: 'negocio',
    ogType: 'business.business',
    title: pageTitle(`${business.name} en ${business.locality}`),
    description: business.description,
    image: business.image,
    path: `/negocio/${business.slug}`,
    url: absoluteUrl(`/negocio/${business.slug}`),
    entity: business,
  }
}

function fromNews(item) {
  return {
    found: true,
    type: 'noticias',
    ogType: 'article',
    title: pageTitle(item.title),
    description: item.excerpt,
    image: item.image,
    path: `/noticias/${item.slug}`,
    url: absoluteUrl(`/noticias/${item.slug}`),
    entity: item,
  }
}

function fromEvent(item) {
  return {
    found: true,
    type: 'eventos',
    ogType: 'website',
    title: pageTitle(item.title),
    description: item.description,
    image: item.image,
    path: `/eventos/${item.slug}`,
    url: absoluteUrl(`/eventos/${item.slug}`),
    entity: item,
  }
}

/** Una sola fuente para SPA, Edge Function y slug inexistente. */
export function getShareEntity(type, slug) {
  const key = String(slug || '').trim()

  if (type === 'categoria') {
    const category = categoryPages.find((item) => item.slug === key)
    return category ? fromCategory(category) : getBrandShare(`/categoria/${key}`)
  }

  if (type === 'negocio') {
    const business = businesses.find((item) => item.slug === key)
    return business ? fromBusiness(business) : getBrandShare(`/negocio/${key}`)
  }

  if (type === 'noticias') {
    const item = news.find((entry) => entry.slug === key)
    return item ? fromNews(item) : getBrandShare(`/noticias/${key}`)
  }

  if (type === 'eventos') {
    const item = events.find((entry) => entry.slug === key)
    return item ? fromEvent(item) : getBrandShare(`/eventos/${key}`)
  }

  return getBrandShare()
}

export function getSitemapEntries() {
  const staticPaths = ['/', '/guia', '/noticias', '/eventos', '/promociones', '/preguntas-frecuentes']
  return [
    ...staticPaths.map((path) => ({ path, url: absoluteUrl(path) })),
    ...categoryPages.map((item) => ({ path: `/categoria/${item.slug}`, url: absoluteUrl(`/categoria/${item.slug}`) })),
    ...businesses.map((item) => ({ path: `/negocio/${item.slug}`, url: absoluteUrl(`/negocio/${item.slug}`) })),
    ...news.map((item) => ({ path: `/noticias/${item.slug}`, url: absoluteUrl(`/noticias/${item.slug}`) })),
    ...events.map((item) => ({ path: `/eventos/${item.slug}`, url: absoluteUrl(`/eventos/${item.slug}`) })),
  ]
}
