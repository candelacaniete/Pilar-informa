/**
 * Clasifica referrer / UTM en fuentes básicas para analytics.
 * @returns {'instagram'|'whatsapp'|'google'|'directo'|'otro'}
 */
export function classifyTrafficSource({ referrer, utmSource, utmMedium } = {}) {
  const utm = `${utmSource || ''} ${utmMedium || ''}`.toLowerCase()
  if (/instagram|ig\b/.test(utm)) return 'instagram'
  if (/whatsapp|wa\b/.test(utm)) return 'whatsapp'
  if (/google/.test(utm)) return 'google'

  const ref = String(referrer || '').trim().toLowerCase()
  if (!ref) return 'directo'

  try {
    const host = new URL(ref).hostname.replace(/^www\./, '')
    if (/instagram\.com|ig\.me|l\.instagram\.com/.test(host)) return 'instagram'
    if (/whatsapp\.com|wa\.me|api\.whatsapp\.com/.test(host)) return 'whatsapp'
    if (/google\./.test(host) || host === 'google.com') return 'google'
    // Same-site navigations count as direct for this basic funnel
    if (/pilarinforma|guiapilar|localhost|127\.0\.0\.1/.test(host)) return 'directo'
    return 'otro'
  } catch {
    return 'otro'
  }
}

export const TRAFFIC_SOURCE_LABELS = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  google: 'Google',
  directo: 'Directo',
  otro: 'Otro',
}
