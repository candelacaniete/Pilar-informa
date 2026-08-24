import { createHash } from 'crypto'
import { headers } from 'next/headers'

const PEPPER = process.env.RESENA_IP_PEPPER || 'pilar-resena-local'

export function hashClientIp(ip) {
  if (!ip || ip === 'unknown') return null
  return createHash('sha256').update(`${PEPPER}:${ip}`).digest('hex')
}

export async function getRequestIpHash() {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
  return hashClientIp(ip)
}
