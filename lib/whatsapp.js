/** WhatsApp de Guía Pilar para altas y consultas comerciales. */
export const CONTACT_WHATSAPP_DISPLAY = '11 7373-9450'
/** Formato internacional para wa.me (AR móvil: 54 9 11 …). */
export const CONTACT_WHATSAPP_E164 = '5491173739450'

export function whatsappUrl(text = '') {
  const base = `https://wa.me/${CONTACT_WHATSAPP_E164}`
  const trimmed = String(text || '').trim()
  if (!trimmed) return base
  return `${base}?text=${encodeURIComponent(trimmed)}`
}
