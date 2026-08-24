'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_FOTOS = 6

/**
 * Carrusel de presentación Premium (máx. 6 fotos).
 * Se muestra por encima del nombre del negocio.
 */
export default function PremiumGallery({ images = [], alt = '' }) {
  const fotos = (images || []).filter((f) => f?.url).slice(0, MAX_FOTOS)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
  }, [fotos.length])

  if (fotos.length === 0) return null

  const current = fotos[Math.min(index, fotos.length - 1)]
  const go = (dir) => {
    setIndex((prev) => (prev + dir + fotos.length) % fotos.length)
  }

  return (
    <section className="relative overflow-hidden bg-ink" aria-label={`Galería de ${alt || 'negocio'}`}>
      <div className="relative mx-auto max-w-6xl">
        <div className="relative aspect-[2/1] sm:aspect-[21/9] md:aspect-[3/1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={alt || 'Foto del negocio'}
            className="h-full w-full object-cover"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-ink/15"
            aria-hidden
          />

          {fotos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft sm:h-10 sm:w-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft sm:h-10 sm:w-10"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {fotos.map((f, i) => (
                  <button
                    key={f.id || f.url}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                      i === index ? 'bg-white' : 'bg-white/40'
                    }`}
                    aria-label={`Foto ${i + 1}`}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {fotos.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto bg-paper/95 px-4 py-2.5 md:px-6">
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
      </div>
    </section>
  )
}
