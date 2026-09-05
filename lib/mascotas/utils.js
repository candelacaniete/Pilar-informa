import { ZONAS_PILAR } from '../zonas.js'

export const MASCOTA_TIPOS = [
  { value: 'perdido', label: 'Perdido' },
  { value: 'encontrado', label: 'Encontrado' },
]

export const MASCOTA_ESTADOS = [
  'pendiente',
  'aprobado',
  'rechazado',
  'inactivo',
  'resuelto',
]

export const MASCOTA_TITULO_MAX = 60
export const MASCOTA_EXPIRA_DIAS = 30

export function isZonaPilar(zona) {
  return ZONAS_PILAR.includes(String(zona || '').trim())
}

/**
 * Normaliza un WhatsApp argentino a E.164 sin “+” para wa.me (549…).
 * Acepta: 11 7373-9450, 1173739450, +54 9 11…, 54911…
 */
export function normalizeWhatsappAr(input) {
  let digits = String(input || '').replace(/\D/g, '')
  if (!digits) return null

  if (digits.startsWith('54')) {
    if (digits.length >= 12 && digits[2] === '9') return digits
    if (digits.length >= 11 && digits[2] !== '9') {
      return `549${digits.slice(2)}`
    }
  }

  if (digits.startsWith('9') && digits.length >= 11) {
    return `54${digits}`
  }

  // Celular local 10 dígitos (ej. 11xxxxxxxx)
  if (digits.length === 10) {
    return `549${digits}`
  }

  // 15 + 8 (viejo móvil CABA) → tratar como 11 + resto
  if (digits.length === 10 && digits.startsWith('15')) {
    return `54911${digits.slice(2)}`
  }

  return null
}

export function isValidWhatsappAr(input) {
  const normalized = normalizeWhatsappAr(input)
  return Boolean(normalized && /^549[0-9]{8,12}$/.test(normalized))
}

export function mascotaWhatsappUrl(e164, text = '') {
  const digits = String(e164 || '').replace(/\D/g, '')
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  const trimmed = String(text || '').trim()
  if (!trimmed) return base
  return `${base}?text=${encodeURIComponent(trimmed)}`
}

export function mascotaEstadoLabel(estado) {
  const map = {
    pendiente: 'Pendiente',
    aprobado: 'Aprobado',
    rechazado: 'Rechazado',
    inactivo: 'Inactivo',
    resuelto: 'Resuelto',
  }
  return map[estado] || estado
}

export function mascotaTipoLabel(tipo) {
  return tipo === 'encontrado' ? 'Encontrado' : 'Perdido'
}

export function buildMascotaShareText({ titulo, tipo, zona, url }) {
  const tipoLabel = tipo === 'encontrado' ? 'Encontrado' : 'Perdido'
  return `${tipoLabel}: ${titulo} · ${zona}\n\nMiralo en Guía Pilar:\n${url}`
}
