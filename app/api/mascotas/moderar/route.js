import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { MASCOTA_EXPIRA_DIAS } from '@/lib/mascotas/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Admin moderation: approve or reject a pet notice.
 * Auth: requires logged-in admin (cookie session + es_admin via RLS update).
 * Uses service role only after verifying the caller is admin via user client.
 */
export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Pedido inválido' }, { status: 400 })
  }

  const id = String(body?.id || '').trim()
  const action = String(body?.action || '').trim()
  const motivo = String(body?.motivo || '').trim()

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Falta el aviso.' }, { status: 400 })
  }
  if (action !== 'aprobar' && action !== 'rechazar') {
    return NextResponse.json({ ok: false, error: 'Acción inválida.' }, { status: 400 })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const userClient = await createClient()
  if (!userClient) {
    return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 })
  }

  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: false, error: 'No autenticado.' }, { status: 401 })
  }

  const { data: adminRow } = await userClient
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) {
    return NextResponse.json({ ok: false, error: 'Sin permiso de admin.' }, { status: 403 })
  }

  const supabase = createServiceClient() || userClient

  if (action === 'aprobar') {
    const now = new Date()
    const expira = new Date(now)
    expira.setDate(expira.getDate() + MASCOTA_EXPIRA_DIAS)

    const { error } = await supabase
      .from('mascotas_avisos')
      .update({
        estado: 'aprobado',
        aprobado_en: now.toISOString(),
        expira_en: expira.toISOString(),
        rechazo_motivo: null,
      })
      .eq('id', id)

    if (error) {
      console.error('mascotas approve', error)
      return NextResponse.json({ ok: false, error: 'No se pudo aprobar.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, message: 'Aviso aprobado.' })
  }

  const { error } = await supabase
    .from('mascotas_avisos')
    .update({
      estado: 'rechazado',
      rechazo_motivo: motivo || 'Rechazado por moderación',
      aprobado_en: null,
      expira_en: null,
    })
    .eq('id', id)

  if (error) {
    console.error('mascotas reject', error)
    return NextResponse.json({ ok: false, error: 'No se pudo rechazar.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: 'Aviso rechazado.' })
}
