'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'

export default function MascotaResolverButton({ token, estado }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(estado === 'resuelto')
  const [message, setMessage] = useState(
    estado === 'resuelto' ? 'Este aviso ya está marcado como resuelto.' : '',
  )
  const [error, setError] = useState('')

  const onResolve = async () => {
    if (done || loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/mascotas/resolver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        setError(data.error || 'No pudimos actualizar el aviso.')
        return
      }
      setDone(true)
      setMessage(data.message || 'Aviso marcado como resuelto.')
    } catch {
      setError('Error de red. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-teal/30 bg-teal-soft/40 px-5 py-6 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-teal" />
        <p className="mt-3 font-semibold text-ink">{message}</p>
        <Link href="/mascotas" className="mt-4 inline-flex text-sm font-semibold text-teal hover:text-teal-dark">
          Ir al listado de mascotas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onResolve}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Ya lo encontré
      </button>
      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}
        </p>
      ) : null}
    </div>
  )
}
