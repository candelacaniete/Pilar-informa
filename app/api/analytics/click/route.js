import { NextResponse } from 'next/server'
import { createServerWriteClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TIPOS = new Set(['whatsapp', 'instagram', 'facebook', 'web'])
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const negocioId = String(body?.negocioId || '').trim()
  const tipo = String(body?.tipo || '').trim()

  if (!ALLOWED_TIPOS.has(tipo)) {
    return NextResponse.json({ ok: false, error: 'tipo inválido' }, { status: 400 })
  }
  if (!UUID_RE.test(negocioId)) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { client: supabase } = createServerWriteClient()
  if (!supabase) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const { error } = await supabase.from('eventos_click').insert({
    negocio_id: negocioId,
    tipo,
  })

  if (error) {
    console.error('eventos_click insert', error.message)
    // No bloquear UX del click externo
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
