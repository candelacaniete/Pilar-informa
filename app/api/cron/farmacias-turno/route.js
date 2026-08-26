import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { runFarmaciasTurnoScrape } from '@/lib/farmacias/scrape'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

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
      {
        ok: false,
        error:
          'Falta SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_URL. Configuralas en Vercel para el cron.',
      },
      { status: 503 },
    )
  }

  const result = await runFarmaciasTurnoScrape(supabase)
  const status = result.ok ? 200 : 502
  return NextResponse.json(result, { status })
}

export async function GET(request) {
  return handle(request)
}

export async function POST(request) {
  return handle(request)
}
