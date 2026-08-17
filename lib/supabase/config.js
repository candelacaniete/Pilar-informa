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

function looksLikeSupabaseUrl(value) {
  if (!looksLikeHttpUrl(value)) return false
  try {
    const host = new URL(value.trim().replace(/^['"]|['"]$/g, '')).hostname
    return host.endsWith('.supabase.co') || host === 'localhost' || host === '127.0.0.1'
  } catch {
    return false
  }
}

export function getSupabaseEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/^['"]|['"]$/g, '')
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/^['"]|['"]$/g, '')

  if (!looksLikeSupabaseUrl(url) || !key || key.startsWith('http')) {
    return { url: null, key: null, configured: false }
  }

  return { url, key, configured: true }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured
}

export function safeSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/^['"]|['"]$/g, '')
  if (looksLikeHttpUrl(raw)) return raw.replace(/\/$/, '')
  return 'http://localhost:3000'
}
