'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_COOKIE = 'cookie_consent'
const ACCEPTED = 'accepted'
const REJECTED = 'rejected'
const MAX_AGE = 60 * 60 * 24 * 365

function readConsent() {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
  if (!match) return null
  const value = match.split('=').slice(1).join('=')
  if (value === ACCEPTED || value === REJECTED) return value
  return null
}

function writeConsent(value) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(readConsent() === null)
  }, [])

  const accept = () => {
    writeConsent(ACCEPTED)
    setVisible(false)
    window.dispatchEvent(new CustomEvent('pilar:cookie-consent', { detail: ACCEPTED }))
  }

  const reject = () => {
    writeConsent(REJECTED)
    setVisible(false)
    window.dispatchEvent(new CustomEvent('pilar:cookie-consent', { detail: REJECTED }))
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[80] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:p-4"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft md:flex-row md:items-center md:gap-5 md:p-5">
        <div className="min-w-0 flex-1">
          <p id="cookie-consent-title" className="text-sm font-semibold text-ink">
            Usamos cookies
          </p>
          <p id="cookie-consent-desc" className="mt-1 text-sm leading-relaxed text-ink-soft">
            Cookies técnicas para el asistente Pilar (límite de consultas) y, si iniciás sesión en
            el panel, para mantener tu sesión. No usamos cookies de publicidad.{' '}
            <Link href="/cookies" className="font-medium text-teal underline-offset-2 hover:underline">
              Más información
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-ink-soft hover:border-ink/30"
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-xl bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-teal/90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  )
}
