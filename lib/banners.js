/** Tarifas de banners (cobro manual por WhatsApp / MercadoPago). */
export const BANNER_PRECIO_HOME_ARS = 150_000
export const BANNER_PRECIO_CATEGORIA_ARS = 165_000
export const BANNER_SLOTS_HOME = 4
export const BANNER_SLOTS_CATEGORIA = 2

export function currentMonthStart(isoDate = null) {
  const day = isoDate || new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  return `${day.slice(0, 7)}-01`
}

export function formatMonthLabel(mesIso) {
  if (!mesIso) return ''
  const [y, m] = mesIso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, 1))
  return new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
}

export function monthOptions(count = 6) {
  const start = currentMonthStart()
  const [y0, m0] = start.split('-').map(Number)
  const options = []
  for (let i = 0; i < count; i += 1) {
    const d = new Date(Date.UTC(y0, m0 - 1 + i, 1))
    const mes = d.toISOString().slice(0, 10)
    options.push({ value: mes, label: formatMonthLabel(mes) })
  }
  return options
}

export function emptyHomeSlots(filled = []) {
  const bySlot = new Map(filled.map((b) => [b.slot, b]))
  return Array.from({ length: BANNER_SLOTS_HOME }, (_, i) => {
    const slot = i + 1
    return { slot, banner: bySlot.get(slot) || null }
  })
}

export function emptyCategoriaSlots(filled = []) {
  const bySlot = new Map(filled.map((b) => [b.slot, b]))
  return Array.from({ length: BANNER_SLOTS_CATEGORIA }, (_, i) => {
    const slot = i + 1
    return { slot, banner: bySlot.get(slot) || null }
  })
}
