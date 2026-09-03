import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function authorize(request) {
  const secret = (process.env.CRON_SECRET || '').trim()
  if (!secret) return false
  const auth = request.headers.get('authorization') || ''
  return auth === `Bearer ${secret}`
}

async function handle(request) {
  if (!authorize(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Falta SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('mascotas_avisos')
    .update({ estado: 'inactivo' })
    .eq('estado', 'aprobado')
    .lt('expira_en', nowIso)
    .select('id')

  if (error) {
    console.error('mascotas expire cron', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    inactivated: data?.length || 0,
    at: nowIso,
  })
}

export async function GET(request) {
  return handle(request)
}

export async function POST(request) {
  return handle(request)
}
