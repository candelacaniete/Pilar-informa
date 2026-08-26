/** Intents de guía con filtro por categoría en gatherPilarContext (como gastro). */
export const CATEGORY_INTENT_FILTERS = {
  gastro: {
    slug: 'gastronomia',
    pattern: /gastro|restau|caf|parrilla|bar/i,
  },
  mascotas: {
    slug: 'mascotas',
    pattern: /vet|mascot|perro|gato/i,
  },
}

export function filterNegociosByCategoryIntent(negocios, intent) {
  const cfg = CATEGORY_INTENT_FILTERS[intent]
  if (!cfg) return negocios
  return negocios.filter(
    (n) =>
      n.categorias?.slug === cfg.slug ||
      cfg.pattern.test(`${n.subcategoria || ''} ${n.nombre || ''}`),
  )
}
