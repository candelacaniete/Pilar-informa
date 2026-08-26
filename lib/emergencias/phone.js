/** Normaliza números AR para href tel: (cortos, 0800, área 011, interior 0230…). */
export function telHref(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('0800')) return `tel:${digits}`
  if (digits.length <= 3) return `tel:${digits}`
  if (digits.startsWith('0')) return `tel:+54${digits.replace(/^0/, '')}`
  if (digits.startsWith('11') && digits.length >= 10) return `tel:+54${digits}`
  return `tel:+54${digits}`
}
