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
  // Fechas date-only (YYYY-MM-DD): evitar UTC midnight → día anterior en AR
  const raw = String(date)
  const value = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
    ...options,
  }).format(value)
}

export function formatShortDate(date) {
  if (!date) return ''
  const raw = String(date)
  const value = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(value)
}

export function planLabel(plan) {
  if (plan === 'premium') return 'Premium'
  if (plan === 'destacado') return 'Destacado'
  return plan || ''
}

const PLAN_SORT_WEIGHT = { premium: 0, destacado: 1 }

export function planSortWeight(plan) {
  return PLAN_SORT_WEIGHT[plan] ?? 9
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
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    inactivo: 'Inactivo',
    resuelto: 'Resuelto',
  }
  return map[estado] || estado
}

import { safeSiteUrl } from '@/lib/supabase/config'

export function siteUrl() {
  return safeSiteUrl()
}

export function sortNegocios(list = []) {
  return [...list].sort((a, b) => {
    const wa = planSortWeight(a.plan)
    const wb = planSortWeight(b.plan)
    if (wa !== wb) return wa - wb
    const pa = Number(a.prioridad ?? 100)
    const pb = Number(b.prioridad ?? 100)
    if (pa !== pb) return pa - pb
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es')
  })
}

export function todayInPilar() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
}

export function addDaysIso(isoDate, days) {
  const d = new Date(`${isoDate}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
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
