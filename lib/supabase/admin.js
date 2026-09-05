import { createClient } from '@supabase/supabase-js'
import { getSupabaseEnv } from './config'

/**
 * Cliente service-role para jobs de servidor (cron). Bypassa RLS.
 * No usar en el browser.
 */
export function createServiceClient() {
  const { url, configured } = getSupabaseEnv()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim().replace(/^['"]|['"]$/g, '')

  if (!configured || !url || !serviceKey || serviceKey.startsWith('http')) {
    return null
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/**
 * Cliente de escritura server-side: prefiere service role; si no está,
 * usa la anon key (requiere policies RLS / RPC de las migraciones 019–021).
 */
export function createServerWriteClient() {
  const service = createServiceClient()
  if (service) return { client: service, mode: 'service' }

  const { url, key, configured } = getSupabaseEnv()
  if (!configured || !url || !key) return { client: null, mode: null }

  return {
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    mode: 'anon',
  }
}
