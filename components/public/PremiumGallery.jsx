'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/** Carrusel de hasta 6 fotos — solo se monta en fichas Premium. */
export default function PremiumGallery({ images = [], alt = '' }) {
  const fotos = (images || []).filter((f) => f?.url).slice(0, 6)
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
    <section className="mt-8">
      <h2 className="font-display text-2xl font-semibold text-ink">Galería</h2>
      <div className="relative mt-4 overflow-hidden rounded-[1.5rem] border border-line/70 bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={alt || 'Foto del negocio'}
          className="aspect-[16/10] w-full object-cover"
        />
        {fotos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-soft"
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
                  className={`h-2 w-2 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
                  aria-label={`Foto ${i + 1}`}
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {fotos.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {fotos.map((f, i) => (
            <button
              key={f.id || f.url}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                i === index ? 'border-teal' : 'border-line/70'
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
