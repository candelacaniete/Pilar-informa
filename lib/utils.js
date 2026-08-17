export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function daysUntil(date) {
  if (!date) return null
  const target = new Date(date)
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate())
  return Math.round((end - start) / (1000 * 60 * 60 * 24))
}

export function formatDate(date, options = {}) {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(new Date(date))
}

export function formatShortDate(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(date))
}

export function planLabel(plan) {
  if (plan === 'premium') return 'Premium'
  if (plan === 'destacado') return 'Destacado'
  return plan || ''
}

export function estadoLabel(estado) {
  const map = {
    activo: 'Activo',
    pausado: 'Pausado',
    vencido: 'Vencido',
    borrador: 'Borrador',
    publicado: 'Publicado',
    activa: 'Activa',
    pausada: 'Pausada',
    vencida: 'Vencida',
  }
  return map[estado] || estado
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export function sortNegocios(list = []) {
  return [...list].sort((a, b) => {
    if (a.plan === 'premium' && b.plan !== 'premium') return -1
    if (b.plan === 'premium' && a.plan !== 'premium') return 1
    const pa = Number(a.prioridad ?? 100)
    const pb = Number(b.prioridad ?? 100)
    if (pa !== pb) return pa - pb
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
  })
}

export function principalFoto(negocio) {
  if (!negocio) return null
  const fotos = negocio.negocio_fotos || negocio.fotos || []
  const principal = fotos.find((f) => f.es_principal) || fotos[0]
  return principal?.url || negocio.imagen || null
}

export function horariosTexto(horarios) {
  if (!horarios) return ''
  if (typeof horarios === 'string') return horarios
  return horarios.texto || ''
}
