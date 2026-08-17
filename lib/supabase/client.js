import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseEnv } from './config'

export function createClient() {
  const { url, key, configured } = getSupabaseEnv()
  if (!configured) return null
  try {
    return createBrowserClient(url, key)
  } catch (err) {
    console.error('Supabase client no se pudo inicializar:', err)
    return null
  }
}

export { isSupabaseConfigured } from './config'
