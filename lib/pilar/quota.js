import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/** Límite de mensajes del bot por mes calendario (America/Argentina/Buenos_Aires). */
export const PILAR_MONTHLY_LIMIT = 35

export const PILAR_UID_COOKIE = 'pilar_uid'
export const PILAR_QUOTA_COOKIE = 'pilar_q'
export const COOKIE_CONSENT_NAME = 'cookie_consent'
export const COOKIE_CONSENT_ACCEPTED = 'accepted'
export const COOKIE_CONSENT_REJECTED = 'rejected'

const UID_MAX_AGE = 60 * 60 * 24 * 365 // ~1 año
const QUOTA_MAX_AGE = 60 * 60 * 24 * 40 // ~40 días
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function argentinaNowParts() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const get = (type) => parts.find((p) => p.type === type)?.value ?? '00'
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
  }
}

/** Primer día del mes calendario en Argentina como date ISO: YYYY-MM-01 */
export function argentinaMonthDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date)
  const year = parts.find((p) => p.type === 'year')?.value ?? '1970'
  const month = parts.find((p) => p.type === 'month')?.value ?? '01'
  return `${year}-${month}-01`
}

/** Clave legible YYYY-MM */
export function argentinaMonthKey(date = new Date()) {
  return argentinaMonthDate(date).slice(0, 7)
}

function daysLeftInArgentinaMonth() {
  const { year, month, day } = argentinaNowParts()
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Math.max(1, lastDay - day + 1)
}

function cookieBase(httpOnly = true) {
  return {
    httpOnly,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}

function parseQuotaCookie(raw) {
  if (!raw || typeof raw !== 'string') return null
  const [monthKey, countRaw] = raw.split(':')
  const count = Number(countRaw)
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey) || !Number.isFinite(count)) {
    return null
  }
  return { monthKey, count: Math.max(0, Math.floor(count)) }
}

function buildStatus(used, degraded = false) {
  const safeUsed = Math.max(0, Math.floor(Number(used) || 0))
  return {
    used: safeUsed,
    remaining: Math.max(0, PILAR_MONTHLY_LIMIT - safeUsed),
    limit: PILAR_MONTHLY_LIMIT,
    monthKey: argentinaMonthKey(),
    daysLeftInMonth: daysLeftInArgentinaMonth(),
    degraded: Boolean(degraded),
  }
}

export async function getCookieConsent() {
  const jar = await cookies()
  const value = jar.get(COOKIE_CONSENT_NAME)?.value
  if (value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_REJECTED) {
    return value
  }
  return null
}

export async function hasAcceptedCookies() {
  return (await getCookieConsent()) === COOKIE_CONSENT_ACCEPTED
}

/**
 * Asegura cookie pilar_uid (UUID). Solo llamar tras consentimiento.
 */
export async function ensurePilarUid() {
  const jar = await cookies()
  const existing = jar.get(PILAR_UID_COOKIE)?.value
  if (existing && UUID_RE.test(existing)) {
    return existing
  }

  const uid = crypto.randomUUID()
  jar.set(PILAR_UID_COOKIE, uid, {
    ...cookieBase(true),
    maxAge: UID_MAX_AGE,
  })
  return uid
}

async function getCookieBackupUsage(monthKey) {
  const jar = await cookies()
  const parsed = parseQuotaCookie(jar.get(PILAR_QUOTA_COOKIE)?.value)
  if (!parsed || parsed.monthKey !== monthKey) {
    return 0
  }
  return parsed.count
}

async function setCookieBackupUsage(monthKey, count) {
  const jar = await cookies()
  jar.set(PILAR_QUOTA_COOKIE, `${monthKey}:${count}`, {
    ...cookieBase(true),
    maxAge: QUOTA_MAX_AGE,
  })
}

function unwrapRpcRow(data) {
  if (data == null) return null
  if (Array.isArray(data)) return data[0] ?? null
  if (typeof data === 'object') return data
  return null
}

/**
 * Estado de cuota sin incrementar.
 * Preferencia: Supabase; si falla → cookie de respaldo (fail-open).
 */
export async function getPilarQuotaStatus() {
  const monthKey = argentinaMonthKey()
  const monthDate = argentinaMonthDate()
  const uid = await ensurePilarUid()
  const cookieUsed = await getCookieBackupUsage(monthKey)

  const supabase = await createClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('pilar_get_uso', {
        p_cliente_id: uid,
        p_mes: monthDate,
      })
      if (!error && data != null) {
        const dbUsed = typeof data === 'number' ? data : Number(unwrapRpcRow(data)?.mensajes ?? 0)
        const used = Math.max(Number.isFinite(dbUsed) ? dbUsed : 0, cookieUsed)
        if (used !== cookieUsed) {
          await setCookieBackupUsage(monthKey, used)
        }
        return buildStatus(used, false)
      }
    } catch {
      // fail-open
    }
  }

  return buildStatus(cookieUsed, true)
}

/**
 * Chequea e incrementa ANTES de llamar a Gemini.
 * Fail-open: si Supabase falla, usa cookie de respaldo.
 */
export async function checkAndIncrementPilarQuota() {
  const monthKey = argentinaMonthKey()
  const monthDate = argentinaMonthDate()
  const uid = await ensurePilarUid()
  const cookieUsed = await getCookieBackupUsage(monthKey)

  if (cookieUsed >= PILAR_MONTHLY_LIMIT) {
    return {
      allowed: false,
      ...buildStatus(cookieUsed, false),
      source: 'cookie',
    }
  }

  const supabase = await createClient()
  if (supabase) {
    try {
      const { data, error } = await supabase.rpc('pilar_check_and_increment', {
        p_cliente_id: uid,
        p_mes: monthDate,
        p_limite: PILAR_MONTHLY_LIMIT,
        p_piso: cookieUsed,
      })

      if (!error && data != null) {
        const row = unwrapRpcRow(data)
        const allowed = Boolean(row?.allowed)
        const used = Math.max(Number(row?.mensajes) || 0, cookieUsed)
        await setCookieBackupUsage(monthKey, used)
        return {
          allowed,
          ...buildStatus(used, false),
          source: 'supabase',
        }
      }
    } catch {
      // fail-open → cookie
    }
  }

  const next = cookieUsed + 1
  await setCookieBackupUsage(monthKey, next)
  return {
    allowed: next <= PILAR_MONTHLY_LIMIT,
    ...buildStatus(next, true),
    source: 'cookie-fallback',
  }
}

/** Mensaje amable cuando se alcanza el tope mensual. */
export function monthlyLimitMessage() {
  return (
    'Llegaste al tope de 35 consultas de este mes con Pilar. ' +
    'El contador se reinicia el 1° del mes siguiente (hora Argentina). ' +
    'Mientras tanto podés seguir explorando la guía o escribirnos a hola@pilarinforma.ar.'
  )
}

export const CONSENT_COOKIE_OPTIONS = {
  ...cookieBase(false),
  maxAge: CONSENT_MAX_AGE,
}
