import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Pedido inválido' }, { status: 400 })
  }

  const token = String(body?.token || '').trim()
  if (!token || token.length < 16) {
    return NextResponse.json({ ok: false, error: 'Link inválido.' }, { status: 400 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Servicio no configurado.' },
      { status: 503 },
    )
  }

  const { data: aviso, error: findError } = await supabase
    .from('mascotas_avisos')
    .select('id, estado, titulo')
    .eq('resolve_token', token)
    .maybeSingle()

  if (findError || !aviso) {
    return NextResponse.json({ ok: false, error: 'No encontramos ese aviso.' }, { status: 404 })
  }

  if (aviso.estado === 'resuelto') {
    return NextResponse.json({ ok: true, message: 'Este aviso ya estaba marcado como resuelto.' })
  }

  if (aviso.estado === 'rechazado' || aviso.estado === 'inactivo') {
    return NextResponse.json(
      { ok: false, error: 'Este aviso ya no está activo.' },
      { status: 400 },
    )
  }

  const { error } = await supabase
    .from('mascotas_avisos')
    .update({ estado: 'resuelto' })
    .eq('id', aviso.id)

  if (error) {
    console.error('mascotas resolve error', error)
    return NextResponse.json({ ok: false, error: 'No pudimos actualizar el aviso.' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    message: '¡Listo! Marcamos el aviso como resuelto y ya no se muestra en el listado.',
  })
}
