/** Copy variado para cards placeholder de negocios (mismo patrón que house banners). */
export const BUSINESS_PLACEHOLDER_COPY = [
  {
    title: '¿Querés aparecer acá?',
    text: 'Sumate a la guía de Pilar.',
  },
  {
    title: 'Este lugar puede ser de tu negocio.',
    text: 'Consultanos por WhatsApp.',
  },
  {
    title: 'Espacio disponible',
    text: 'Escribinos y reservá tu perfil.',
  },
  {
    title: '¿Tu negocio necesita más visibilidad?',
    text: 'Aparecé en Guía Pilar.',
  },
]

export const PROMO_PLACEHOLDER_COPY = {
  title: 'Espacio disponible',
  text: 'Sumate a Guía Pilar.',
}

export function getBusinessPlaceholderCopy(index) {
  return BUSINESS_PLACEHOLDER_COPY[index % BUSINESS_PLACEHOLDER_COPY.length]
}

/**
 * Rellena una grilla con placeholders cuando faltan negocios reales.
 * @param {Array} businesses
 * @param {number} targetCount — mínimo de slots a mostrar
 * @param {number} [offset=0] — desplaza el copy variado
 */
export function padWithBusinessPlaceholders(businesses, targetCount, offset = 0) {
  const items = businesses.map((business) => ({ kind: 'business', business }))
  const missing = Math.max(0, targetCount - items.length)

  for (let i = 0; i < missing; i += 1) {
    items.push({
      kind: 'placeholder',
      key: `business-ph-${offset + i}`,
      copy: getBusinessPlaceholderCopy(offset + i),
    })
  }

  return items
}

/** Rellena promociones con placeholders cuando no hay activas. */
export function padWithPromoPlaceholders(promociones, targetCount) {
  const items = promociones.map((promo) => ({ kind: 'promo', promo }))
  const missing = Math.max(0, targetCount - items.length)

  for (let i = 0; i < missing; i += 1) {
    items.push({
      kind: 'placeholder',
      key: `promo-ph-${i}`,
      copy: PROMO_PLACEHOLDER_COPY,
    })
  }

  return items
}
