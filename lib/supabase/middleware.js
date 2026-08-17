import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseEnv } from './config'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request })

  const { url, key, configured } = getSupabaseEnv()
  if (!configured) return supabaseResponse

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    const isAdminRoute = path.startsWith('/admin')
    const isLogin = path === '/admin/login'

    if (isAdminRoute && !isLogin && !user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin/login'
      return NextResponse.redirect(redirectUrl)
    }

    if (isLogin && user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/admin'
      return NextResponse.redirect(redirectUrl)
    }
  } catch (err) {
    console.error('Supabase middleware no se pudo inicializar:', err)
  }

  return supabaseResponse
}
