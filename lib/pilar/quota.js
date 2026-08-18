import { cookies } from 'next/headers'
import { todayInPilar } from '@/lib/utils'

export const PILAR_DAILY_LIMIT = 12
const COOKIE = 'pilar_q'

function parseQuota(raw) {
  if (!raw || !raw.includes(':')) return { date: todayInPilar(), count: 0 }
  const [date, count] = raw.split(':')
  const n = Number(count)
  if (date !== todayInPilar() || Number.isNaN(n)) return { date: todayInPilar(), count: 0 }
  return { date, count: n }
}

export async function readPilarQuota() {
  const store = await cookies()
  return parseQuota(store.get(COOKIE)?.value)
}

export async function consumePilarQuota() {
  const current = await readPilarQuota()
  if (current.count >= PILAR_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: PILAR_DAILY_LIMIT }
  }

  const nextCount = current.count + 1
  const remaining = PILAR_DAILY_LIMIT - nextCount
  const store = await cookies()
  store.set(COOKIE, `${todayInPilar()}:${nextCount}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return { allowed: true, remaining, limit: PILAR_DAILY_LIMIT }
}
