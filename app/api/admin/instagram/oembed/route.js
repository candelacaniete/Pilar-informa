import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchInstagramOEmbedBatch } from '@/lib/instagram/oembed'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function requireAdmin() {
  const supabase = await createClient()
  if (!supabase) {
    return { error: NextResponse.json({ ok: false, error: 'Supabase no configurado' }, { status: 503 }) }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: isAdmin, error } = await supabase.rpc('es_admin')
  if (error || !isAdmin) {
    return { error: NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase }
}

export async function POST(request) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 })
  }

  const urls = Array.isArray(body?.urls) ? body.urls : []
  if (!urls.length) {
    return NextResponse.json({ ok: false, error: 'Enviá al menos una URL de Instagram' }, { status: 400 })
  }
  if (urls.length > 6) {
    return NextResponse.json({ ok: false, error: 'Máximo 6 publicaciones' }, { status: 400 })
  }

  const results = await fetchInstagramOEmbedBatch(urls)
  const okCount = results.filter((r) => r.ok).length

  return NextResponse.json({
    ok: okCount > 0,
    results,
    synced: okCount,
    failed: results.length - okCount,
  })
}
