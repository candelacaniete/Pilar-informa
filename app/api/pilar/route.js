import { NextResponse } from 'next/server'
import { gatherPilarContext } from '@/lib/pilar/context'
import { buildPilarReply } from '@/lib/pilar/answer'
import { PILAR_DAILY_LIMIT, readPilarQuota } from '@/lib/pilar/quota'
import { todayInPilar } from '@/lib/utils'

const COOKIE = 'pilar_q'

function parseQuota(raw) {
  if (!raw || !raw.includes(':')) return { date: todayInPilar(), count: 0 }
  const [date, count] = raw.split(':')
  const n = Number(count)
  if (date !== todayInPilar() || Number.isNaN(n)) return { date: todayInPilar(), count: 0 }
  return { date, count: n }
}

function quotaFromRequest(request) {
  return parseQuota(request.cookies.get(COOKIE)?.value)
}

function withQuotaCookie(response, count) {
  response.cookies.set(COOKIE, `${todayInPilar()}:${count}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return response
}

export async function GET(request) {
  const quota = quotaFromRequest(request)
  return NextResponse.json({
    remaining: Math.max(0, PILAR_DAILY_LIMIT - quota.count),
    limit: PILAR_DAILY_LIMIT,
  })
}

export async function POST(request) {
  let message = ''
  try {
    const body = await request.json()
    message = String(body?.message || '').trim()
  } catch {
    return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 })
  }

  if (!message || message.length > 400) {
    return NextResponse.json({ error: 'Escribí una pregunta corta.' }, { status: 400 })
  }

  const quota = quotaFromRequest(request)
  if (quota.count >= PILAR_DAILY_LIMIT) {
    return NextResponse.json(
      {
        error: `Llegaste al límite de ${PILAR_DAILY_LIMIT} consultas por día. Volvé mañana.`,
        remaining: 0,
        limit: PILAR_DAILY_LIMIT,
      },
      { status: 429 },
    )
  }

  try {
    const context = await gatherPilarContext(message)
    const reply = await buildPilarReply(message, context)
    const nextCount = quota.count + 1
    const remaining = PILAR_DAILY_LIMIT - nextCount
    return withQuotaCookie(
      NextResponse.json({ reply, remaining, limit: PILAR_DAILY_LIMIT }),
      nextCount,
    )
  } catch (err) {
    console.error('Pilar API error:', err)
    return NextResponse.json(
      { error: 'No pude responder ahora. Probá de nuevo en un momento.' },
      { status: 500 },
    )
  }
}
