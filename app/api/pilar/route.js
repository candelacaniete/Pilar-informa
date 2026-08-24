import { NextResponse } from 'next/server'
import { gatherPilarContext } from '@/lib/pilar/context'
import { buildPilarReply } from '@/lib/pilar/answer'
import {
  PILAR_MONTHLY_LIMIT,
  checkAndIncrementPilarQuota,
  getPilarQuotaStatus,
  hasAcceptedCookies,
  monthlyLimitMessage,
} from '@/lib/pilar/quota'

export async function GET() {
  if (!(await hasAcceptedCookies())) {
    return NextResponse.json({
      remaining: null,
      limit: PILAR_MONTHLY_LIMIT,
      needsConsent: true,
    })
  }

  try {
    const status = await getPilarQuotaStatus()
    return NextResponse.json({
      remaining: status.remaining,
      limit: status.limit,
      used: status.used,
      monthKey: status.monthKey,
      needsConsent: false,
    })
  } catch (err) {
    console.error('Pilar quota GET error:', err)
    return NextResponse.json({
      remaining: PILAR_MONTHLY_LIMIT,
      limit: PILAR_MONTHLY_LIMIT,
      needsConsent: false,
    })
  }
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

  if (!(await hasAcceptedCookies())) {
    return NextResponse.json(
      {
        error:
          'Para chatear con Pilar necesitamos guardar unas cookies técnicas. Aceptá las cookies desde el aviso del sitio.',
        remaining: null,
        limit: PILAR_MONTHLY_LIMIT,
        needsConsent: true,
      },
      { status: 403 },
    )
  }

  let quota
  try {
    quota = await checkAndIncrementPilarQuota()
  } catch (err) {
    console.error('Pilar quota check error:', err)
    return NextResponse.json(
      { error: 'No pude responder ahora. Probá de nuevo en un momento.' },
      { status: 500 },
    )
  }

  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: monthlyLimitMessage(),
        remaining: 0,
        limit: quota.limit,
        used: quota.used,
      },
      { status: 429 },
    )
  }

  try {
    const context = await gatherPilarContext(message)
    const reply = await buildPilarReply(message, context)
    return NextResponse.json({
      reply,
      remaining: quota.remaining,
      limit: quota.limit,
      used: quota.used,
    })
  } catch (err) {
    console.error('Pilar API error:', err)
    return NextResponse.json(
      { error: 'No pude responder ahora. Probá de nuevo en un momento.' },
      { status: 500 },
    )
  }
}
