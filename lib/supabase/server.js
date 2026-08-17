import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseEnv } from './config'

export async function createClient() {
  const { url, key, configured } = getSupabaseEnv()
  if (!configured) return null

  try {
    const cookieStore = await cookies()

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignorado en Server Components (solo lectura de cookies).
          }
        },
      },
    })
  } catch (err) {
    console.error('Supabase server client no se pudo inicializar:', err)
    return null
  }
}
