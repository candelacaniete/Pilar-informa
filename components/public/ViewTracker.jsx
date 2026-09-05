'use client'

import { useEffect, useRef } from 'react'

/**
 * Registra una vista de ficha (negocio o mascota) una vez por montaje.
 */
export default function ViewTracker({ entityType, entityId, entitySlug, entityTitle }) {
  const sent = useRef(false)

  useEffect(() => {
    if (sent.current || !entityType || !entityId) return
    sent.current = true

    const params = new URLSearchParams(window.location.search)
    const payload = {
      entityType,
      entityId,
      entitySlug: entitySlug || null,
      entityTitle: entityTitle || null,
      referrer: document.referrer || null,
      utmSource: params.get('utm_source'),
      utmMedium: params.get('utm_medium'),
    }

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/view', blob)
      return
    }

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }, [entityType, entityId, entitySlug, entityTitle])

  return null
}
