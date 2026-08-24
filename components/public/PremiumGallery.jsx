'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MAX_FOTOS = 6

/**
 * Carrusel de presentación Premium (máx. 6 fotos).
 * Ancho contenido, flechas siempre visibles si hay más de 1 foto.
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
    <section className="mb-6" aria-label={`Galería de ${alt || 'negocio'}`}>
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line/70 bg-paper-deep">
        <div className="relative aspect-[16/9] sm:aspect-[2/1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.url}
            alt={alt || 'Foto del negocio'}
            className="h-full w-full object-cover"
          />

          {canNavigate ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lift ring-1 ring-line/80 transition hover:bg-teal-soft sm:left-3"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 z-20 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lift ring-1 ring-line/80 transition hover:bg-teal-soft sm:right-3"
                aria-label="Foto siguiente"
              >
                <ChevronRight className="h-6 w-6" strokeWidth={2.25} />
              </button>
              <p className="absolute bottom-2 right-2 z-20 rounded-md bg-ink/65 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
                {index + 1} / {fotos.length}
              </p>
            </>
          ) : null}
        </div>
      </div>

      {canNavigate ? (
        <div className="mx-auto mt-3 flex max-w-3xl justify-center gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <button
              key={f.id || f.url}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition sm:h-16 sm:w-24 ${
                i === index ? 'border-teal ring-2 ring-teal/30' : 'border-line/70 opacity-80 hover:opacity-100'
              }`}
              aria-label={`Ir a foto ${i + 1}`}
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
