'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { formatResenaDate } from '@/lib/resenas'

function Stars({ value, size = 'sm' }) {
  const cls = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${cls} ${n <= value ? 'fill-amber text-amber' : 'text-line'}`}
        />
      ))}
    </span>
  )
}

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition hover:scale-105 disabled:opacity-50"
          aria-label={`${n} estrellas`}
        >
          <Star
            className={`h-8 w-8 ${n <= value ? 'fill-amber text-amber' : 'text-line hover:text-amber/60'}`}
          />
        </button>
      ))}
    </div>
  )
}

function ResenaForm({ slug, negocioNombre, onSuccess }) {
  const [codigo, setCodigo] = useState('')
  const [calificacion, setCalificacion] = useState(0)
  const [texto, setTexto] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError('')

    if (!calificacion) {
      setError('Elegí cuántas estrellas le das.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, codigo, calificacion, texto }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'No se pudo publicar.')
        return
      }
      setDone(true)
      setCodigo('')
      setCalificacion(0)
      setTexto('')
      onSuccess?.()
    } catch {
      setError('Hubo un problema de conexión.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-teal/30 bg-teal-soft/40 px-4 py-3 text-sm text-teal-dark">
        ¡Gracias por tu reseña! Ya la sumamos al perfil de {negocioNombre}.
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <StarPicker value={calificacion} onChange={setCalificacion} disabled={loading} />
      <label className="block text-sm">
        <span className="font-medium text-ink">Código del negocio</span>
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="Ej. A3K9MX"
          maxLength={12}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2.5 font-mono text-sm uppercase tracking-wider outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
          autoComplete="off"
        />
        <span className="mt-1 block text-xs text-muted">
          Te lo comparte {negocioNombre} cuando fuiste cliente.
        </span>
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">Comentario (opcional)</span>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Contá tu experiencia…"
          className="mt-1.5 w-full resize-y rounded-xl border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
      >
        {loading ? 'Publicando…' : 'Publicar reseña'}
      </button>
    </form>
  )
}

export default function ResenasSection({ negocio, resenasIniciales = [] }) {
  const router = useRouter()
  const [resenas, setResenas] = useState(resenasIniciales)
  const [open, setOpen] = useState(false)

  const refresh = async () => {
    try {
      const res = await fetch(`/api/resenas?slug=${encodeURIComponent(negocio.slug)}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.resenas)) setResenas(data.resenas)
      }
    } catch {
      // mantener lista actual
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <section className="mt-10 rounded-2xl border border-line/70 bg-paper/50 p-5 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">Reseñas</h2>
          {negocio.cantidad_opiniones > 0 ? (
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
              <Stars value={Math.round(Number(negocio.rating) || 0)} />
              <span className="font-semibold text-ink">{Number(negocio.rating).toFixed(1)}</span>
              <span className="text-muted">
                · {negocio.cantidad_opiniones}{' '}
                {negocio.cantidad_opiniones === 1 ? 'opinión' : 'opiniones'}
              </span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">Todavía no hay reseñas publicadas.</p>
          )}
        </div>
        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-teal/40 bg-white px-4 py-2.5 text-sm font-semibold text-teal transition hover:bg-teal-soft"
          >
            Dejar reseña
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="mt-5 rounded-2xl border border-line/80 bg-white p-4 md:p-5">
          <p className="text-sm leading-relaxed text-ink-soft">
            ¿Trabajaste con <strong className="font-semibold text-ink">{negocio.nombre}</strong>?
            Dejale una reseña con su código.
          </p>
          <div className="mt-4">
            <ResenaForm slug={negocio.slug} negocioNombre={negocio.nombre} onSuccess={refresh} />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-3 text-sm font-medium text-muted hover:text-ink"
          >
            Cancelar
          </button>
        </div>
      ) : null}

      {resenas.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {resenas.map((r) => (
            <li key={r.id} className="border-t border-line/60 pt-4 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars value={r.calificacion} />
                <time className="text-xs text-muted" dateTime={r.creado_en}>
                  {formatResenaDate(r.creado_en)}
                </time>
              </div>
              {r.texto ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.texto}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
