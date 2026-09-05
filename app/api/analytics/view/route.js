import { NextResponse } from 'next/server'
import { createServerWriteClient } from '@/lib/supabase/admin'
import { classifyTrafficSource } from '@/lib/analytics/referrer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const entityType = String(body?.entityType || '').trim()
  const entityId = String(body?.entityId || '').trim()
  const entitySlug = body?.entitySlug ? String(body.entitySlug).trim() : null
  const entityTitle = body?.entityTitle ? String(body.entityTitle).trim().slice(0, 160) : null
  const referrerRaw = body?.referrer ? String(body.referrer).slice(0, 500) : null
  const utmSource = body?.utmSource ? String(body.utmSource).slice(0, 80) : null
  const utmMedium = body?.utmMedium ? String(body.utmMedium).slice(0, 80) : null

  if (entityType !== 'negocio' && entityType !== 'mascota') {
    return NextResponse.json({ ok: false, error: 'entityType inválido' }, { status: 400 })
  }
  if (!entityId) {
    return NextResponse.json({ ok: false, error: 'Falta entityId' }, { status: 400 })
  }

  // UUID check — evitar inserts inválidos que rompen la tabla
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(entityId)) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { client: supabase } = createServerWriteClient()
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const referrerSource = classifyTrafficSource({
    referrer: referrerRaw,
    utmSource,
    utmMedium,
  })

  const { error } = await supabase.from('page_views').insert({
    entity_type: entityType,
    entity_id: entityId,
    entity_slug: entitySlug,
    entity_title: entityTitle,
    referrer_source: referrerSource,
    referrer_raw: referrerRaw,
  })

  if (error) {
    console.error('page_views insert', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true, source: referrerSource })
}
