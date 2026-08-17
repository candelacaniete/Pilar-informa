import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeSiteUrl } from '@/lib/supabase/config'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/admin'
  const siteUrl = safeSiteUrl()

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=auth`)
  }

  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.redirect(`${siteUrl}/admin/login?error=config`)
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('Auth callback error:', error.message)
    return NextResponse.redirect(`${siteUrl}/admin/login?error=auth`)
  }

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/admin'
  return NextResponse.redirect(`${siteUrl}${safeNext}`)
}
