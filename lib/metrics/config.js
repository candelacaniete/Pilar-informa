/** Capas del dashboard: operación interna vs indicadores comerciales. */
export const METRICS_LAYER = {
  OPERATIONAL: 'operational',
  SALES: 'sales',
}

/** Precios mensuales de planes (ARS). Fuente única para métricas, calculadora y /planes. */
export const PLAN_PRICES_ARS = {
  destacado: 18_000,
  premium: 28_000,
}

export const PLAN_ORDER = ['premium', 'destacado']

export const FUENTE_ALTA_OPTIONS = [
  { value: 'cartera', label: 'Cartera de Pablo' },
  { value: 'redes', label: 'Redes' },
  { value: 'organico', label: 'Orgánico' },
  { value: 'referido', label: 'Referido' },
  { value: 'otro', label: 'Otro' },
]

export function fuenteAltaLabel(value) {
  if (!value) return 'Sin registrar'
  return FUENTE_ALTA_OPTIONS.find((o) => o.value === value)?.label || value
}

export function planPriceArs(plan) {
  return PLAN_PRICES_ARS[plan] ?? 0
}

export function formatArs(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function calcBusinessesNeeded(gap, price) {
  if (gap <= 0 || price <= 0) return 0
  return Math.ceil(gap / price)
}
