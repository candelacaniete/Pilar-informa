function looksLikeHttpUrl(value) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  try {
    const parsed = new URL(trimmed)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function getSupabaseEnv() {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  if (!looksLikeHttpUrl(url) || !key) {
    return { url: null, key: null, configured: false }
  }

  return { url, key, configured: true }
}

export function isSupabaseConfigured() {
  return getSupabaseEnv().configured
}
