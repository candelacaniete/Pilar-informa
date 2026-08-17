import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './config'

export function createClient() {
  const { url, key, configured } = getSupabaseEnv()
  if (!configured) return null
  return createBrowserClient(url, key)
}

export { isSupabaseConfigured } from './config'
