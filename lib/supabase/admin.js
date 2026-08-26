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
