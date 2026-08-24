import { BRAND, CONTACT_EMAIL, absoluteUrl } from './site.js'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: BRAND,
    url: absoluteUrl('/'),
    email: CONTACT_EMAIL,
    description:
      'Guía local de Pilar, Buenos Aires: comercios, profesionales, noticias, eventos y promociones.',
    areaServed: {
      '@type': 'City',
      name: 'Pilar',
    },
  }
}

export function localBusinessJsonLd(business) {
  const schemaType = schemaTypeFor(business)
  const data = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: business.name,
    description: business.description,
    image: business.image,
    url: absoluteUrl(`/negocio/${business.slug}`),
    telephone: business.whatsapp,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.locality,
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
  }

  if (business.rating && business.reviews) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating,
      reviewCount: business.reviews,
      bestRating: 5,
    }
  }

  return data
}

export function newsArticleJsonLd(item) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.excerpt,
    image: item.image,
    datePublished: item.publishedAt,
    dateModified: item.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Redacción Guía Pilar',
    },
    publisher: {
      '@type': 'Organization',
      name: BRAND,
    },
    mainEntityOfPage: absoluteUrl(`/noticias/${item.slug}`),
  }
}

export function eventJsonLd(item) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: item.title,
    description: item.description,
    image: item.image,
    startDate: item.startDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: item.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: item.locality,
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

export function categoryJsonLd(category, listings = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.h1,
    description: category.description,
    image: category.image,
    url: absoluteUrl(`/categoria/${category.slug}`),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: listings.map((business, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/negocio/${business.slug}`),
        name: business.name,
      })),
    },
  }
}

export function faqPageJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

function schemaTypeFor(business) {
  const key = `${business.category} ${business.subcategory}`.toLowerCase()
  if (key.includes('veterinar')) return 'VeterinaryCare'
  if (key.includes('farmacia')) return 'Pharmacy'
  if (key.includes('gimnasio')) return 'HealthClub'
  if (key.includes('café') || key.includes('brunch')) return 'CafeOrCoffeeShop'
  if (key.includes('gastronom')) return 'Restaurant'
  if (key.includes('abogad')) return 'LegalService'
  if (key.includes('pelu') || key.includes('estética') || key.includes('belleza')) return 'BeautySalon'
  if (key.includes('mecán') || key.includes('automotor')) return 'AutoRepair'
  if (key.includes('librer')) return 'BookStore'
  return 'LocalBusiness'
}
