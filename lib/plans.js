/** Catálogo público de planes (precios en lib/metrics/config.js). */
import { formatArs, PLAN_PRICES_ARS } from '@/lib/metrics/config'

export const PUBLIC_PLAN_CATALOG = [
  {
    value: 'destacado',
    label: 'Destacado',
    priceArs: PLAN_PRICES_ARS.destacado,
    hint: 'Ficha en la guía, foto principal y visibilidad en búsquedas.',
    features: [
      'Ficha completa en la guía',
      'Foto principal',
      'Visibilidad en búsquedas y categorías',
      'Badge Destacado en tu perfil',
    ],
  },
  {
    value: 'premium',
    label: 'Premium',
    priceArs: PLAN_PRICES_ARS.premium,
    hint: 'Más prioridad, galería de fotos y mayor presencia en home.',
    features: [
      'Todo lo de Destacado',
      'Mayor prioridad en listados y home',
      'Galería de hasta 6 fotos',
      'Badge Premium en tu perfil',
    ],
  },
]

export function formatPlanPriceArs(plan) {
  const entry = PUBLIC_PLAN_CATALOG.find((p) => p.value === plan)
  return formatArs(entry?.priceArs ?? PLAN_PRICES_ARS[plan] ?? 0)
}
