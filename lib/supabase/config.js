import { SITE_URL } from '@/lib/seo/site'

function looksLikeHttpUrl(value) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim().replace(/^['"]|['"]$/g, '')
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

/** Quita /rest/v1, /auth/v1 y barras finales que rompen las llamadas a Supabase. */
export function normalizeSupabaseUrl(raw) {
  if (!raw || typeof raw !== 'string') return null

  let url = raw.trim().replace(/^['"]|['"]$/g, '')
  if (!looksLikeHttpUrl(url)) return null

  url = url.replace(/\/+$/, '')
  url = url.replace(/\/rest\/v1$/i, '').replace(/\/+$/, '')
  url = url.replace(/\/auth\/v1$/i, '').replace(/\/+$/, '')

  return url
}

function looksLikeSupabaseUrl(value) {
  const normalized = normalizeSupabaseUrl(value)
  if (!normalized) return false
  try {
    const host = new URL(normalized).hostname
    return host.endsWith('.supabase.co') || host === 'localhost' || host === '127.0.0.1'
  } catch {
    return false
  }
}

export function getSupabaseEnv() {
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/^['"]|['"]$/g, '')
  const url = normalizeSupabaseUrl(rawUrl)

  if (!looksLikeSupabaseUrl(rawUrl) || !url || !key || key.startsWith('http')) {
    return { url: null, key: null, configured: false, rawUrl }
  }

  return { url, key, configured: true, rawUrl }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured
}

export function supabaseUrlMisconfigurationHint(rawUrl) {
  const trimmed = (rawUrl || '').trim()
  if (!trimmed) {
    return 'Falta NEXT_PUBLIC_SUPABASE_URL en Vercel.'
  }
  if (trimmed.includes('vercel.app')) {
    return 'NEXT_PUBLIC_SUPABASE_URL no puede ser la URL de la web. Usá el Project URL de Supabase (https://xxxx.supabase.co).'
  }
  if (/\/rest\/v1/i.test(trimmed) || /\/auth\/v1/i.test(trimmed)) {
    return 'NEXT_PUBLIC_SUPABASE_URL no debe incluir /rest/v1 ni /auth/v1. En Supabase → Settings → API copiá solo el Project URL: https://xxxx.supabase.co'
  }
  if (trimmed.endsWith('/')) {
    return 'NEXT_PUBLIC_SUPABASE_URL no debe terminar en /. Dejalo como https://xxxx.supabase.co'
  }
  if (!trimmed.includes('.supabase.co')) {
    return 'NEXT_PUBLIC_SUPABASE_URL debe ser el Project URL de Supabase (https://xxxx.supabase.co).'
  }
  return 'Revisá NEXT_PUBLIC_SUPABASE_URL en Vercel → Settings → Environment Variables y redeployá.'
}

/** Hostnames legacy que deben resolver al dominio canónico (SEO). */
const LEGACY_SITE_HOSTS = new Set(['pilar-informa-eosin.vercel.app'])

export function safeSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/^['"]|['"]$/g, '')
  if (looksLikeHttpUrl(raw)) {
    const normalized = raw.replace(/\/$/, '')
    try {
      if (LEGACY_SITE_HOSTS.has(new URL(normalized).hostname)) {
        return SITE_URL
      }
    } catch {
      // ignore
    }
    return normalized
  }
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
    return SITE_URL
  }
  return 'http://localhost:3000'
}

/** URL de retorno para emails de Supabase Auth (reset, confirmación). */
export function authRedirectUrl(nextPath = '/admin', origin) {
  const base = (origin || safeSiteUrl()).replace(/\/$/, '')
  const next = nextPath.startsWith('/') ? nextPath : `/${nextPath}`
  return `${base}/auth/callback?next=${encodeURIComponent(next)}`
}
