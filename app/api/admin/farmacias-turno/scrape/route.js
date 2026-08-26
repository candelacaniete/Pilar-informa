import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { runFarmaciasTurnoScrape } from '@/lib/farmacias/scrape'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

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

export async function POST() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const service = createServiceClient()
  if (!service) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Falta SUPABASE_SERVICE_ROLE_KEY en Vercel (Production). Sin eso el scrape no puede escribir farmacias_scrape_runs.',
      },
      { status: 503 },
    )
  }

  const result = await runFarmaciasTurnoScrape(service)
  const status = result.ok ? 200 : 502
  return NextResponse.json(result, { status })
}
