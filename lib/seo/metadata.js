import { BRAND, CONTACT_EMAIL, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/seo/site'
import { siteUrl } from '@/lib/utils'

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noIndex = false,
}) {
  const url = `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`
  const ogTitle = title || `${BRAND} — Todo Pilar. En un solo lugar.`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: BRAND,
      locale: 'es_AR',
      type,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: image ? [image] : undefined,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: siteUrl(),
    email: CONTACT_EMAIL,
    description: DEFAULT_DESCRIPTION,
    areaServed: { '@type': 'City', name: 'Pilar' },
  }
}

export function localBusinessJsonLd(negocio, image) {
  const key = `${negocio.categorias?.nombre || ''} ${negocio.subcategoria || ''}`.toLowerCase()
  let type = 'LocalBusiness'
  if (key.includes('veterinar')) type = 'VeterinaryCare'
  else if (key.includes('farmacia')) type = 'Pharmacy'
  else if (key.includes('gimnasio')) type = 'HealthClub'
  else if (key.includes('café') || key.includes('brunch')) type = 'CafeOrCoffeeShop'
  else if (key.includes('gastronom') || key.includes('restaur')) type = 'Restaurant'
  else if (key.includes('abogad')) type = 'LegalService'
  else if (key.includes('pelu') || key.includes('estética') || key.includes('belleza')) type = 'BeautySalon'
  else if (key.includes('mecán') || key.includes('automotor')) type = 'AutoRepair'
  else if (key.includes('librer')) type = 'BookStore'

  const data = {
    '@context': 'https://schema.org',
    '@type': type,
    name: negocio.nombre,
    description: negocio.descripcion_corta || negocio.descripcion_larga,
    image: image || undefined,
    url: `${siteUrl()}/negocio/${negocio.slug}`,
    telephone: negocio.telefono || negocio.whatsapp || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: negocio.direccion || undefined,
      addressLocality: negocio.localidad || 'Pilar',
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
  }

  if (negocio.lat && negocio.lng) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude: negocio.lat,
      longitude: negocio.lng,
    }
  }

  if (negocio.rating > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: negocio.rating,
      reviewCount: negocio.cantidad_opiniones || 1,
      bestRating: 5,
    }
  }

  return data
}

export function newsArticleJsonLd(noticia) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: noticia.titulo,
    description: noticia.bajada,
    image: noticia.imagen || undefined,
    datePublished: noticia.publicado_en,
    dateModified: noticia.publicado_en,
    author: {
      '@type': 'Organization',
      name: noticia.autor || 'Redacción Guía Pilar',
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
    },
    mainEntityOfPage: `${siteUrl()}/noticias/${noticia.slug}`,
  }
}

export function eventJsonLd(evento) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.titulo,
    description: evento.descripcion,
    image: evento.imagen || undefined,
    startDate: evento.fecha,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: evento.ubicacion,
      address: {
        '@type': 'PostalAddress',
        addressLocality: evento.localidad || 'Pilar',
        addressRegion: 'Buenos Aires',
        addressCountry: 'AR',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: BRAND,
    },
  }
}

export function categoryCollectionJsonLd(categoria, aeo, negocios = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: aeo.h1,
    description: aeo.description,
    image: aeo.image || undefined,
    url: `${siteUrl()}/categoria/${categoria.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: negocios.map((n, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${siteUrl()}/negocio/${n.slug}`,
        name: n.nombre,
      })),
    },
  }
}
