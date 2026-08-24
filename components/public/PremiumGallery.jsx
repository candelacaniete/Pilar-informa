'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_FOTOS = 6

/**
 * Carrusel de presentación Premium (máx. 6 fotos).
 * Full-bleed sobre fondo paper (sin laterales negros).
 */
export default function PremiumGallery({ images = [], alt = '' }) {
  const fotos = (images || []).filter((f) => f?.url).slice(0, MAX_FOTOS)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [fotos.length])

  if (fotos.length === 0) return null

  const current = fotos[Math.min(index, fotos.length - 1)]
  const canNavigate = fotos.length > 1
  const go = (dir) => {
    if (!canNavigate) return
    setIndex((prev) => (prev + dir + fotos.length) % fotos.length)
  }

  return (
    <section className="relative bg-paper" aria-label={`Galería de ${alt || 'negocio'}`}>
      <div className="relative h-44 overflow-hidden sm:h-52 md:h-60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={alt || 'Foto del negocio'}
          className="h-full w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-paper via-transparent to-transparent"
          aria-hidden
        />

        {canNavigate ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-white text-ink shadow-soft transition hover:bg-teal-soft sm:left-4 sm:h-11 sm:w-11"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line/80 bg-white text-ink shadow-soft transition hover:bg-teal-soft sm:right-4 sm:h-11 sm:w-11"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
              {fotos.map((f, i) => (
                <button
                  key={f.id || f.url}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? 'bg-teal' : 'bg-white/80 ring-1 ring-ink/15'
                  }`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5 md:px-6">
          {fotos.map((f, i) => (
            <button
              key={f.id || f.url}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-12 w-16 shrink-0 overflow-hidden rounded-md border sm:h-14 sm:w-20 ${
                i === index ? 'border-teal ring-1 ring-teal/40' : 'border-line/70'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}
