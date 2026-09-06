'use client'

/**
 * Link externo de contacto que registra el click (fire-and-forget) antes de salir.
 */
export default function ContactClickLink({
  negocioId,
  tipo,
  href,
  className,
  children,
  ...rest
}) {
  const track = () => {
    if (!negocioId || !tipo || !href) return
    const payload = JSON.stringify({ negocioId, tipo })
    try {
      const blob = new Blob([payload], { type: 'application/json' })
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/click', blob)
        return
      }
    } catch {
      // fallback abajo
    }
    fetch('/api/analytics/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {})
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      onClick={track}
      {...rest}
    >
      {children}
    </a>
  )
}
