'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, Star, X } from 'lucide-react'
import { principalFoto } from '@/lib/utils'

const mapFilters = [
  { id: 'comer', label: 'Comer', emoji: '🍽️', match: (b) => b.categorias?.slug === 'gastronomia' },
  { id: 'comprar', label: 'Comprar', emoji: '🛍️', match: (b) => b.categorias?.slug === 'compras' },
  { id: 'salud', label: 'Salud', emoji: '🏥', match: (b) => b.categorias?.slug === 'salud' },
  {
    id: 'servicios',
    label: 'Servicios',
    emoji: '🔧',
    match: (b) =>
      ['servicios', 'profesionales', 'automotor', 'hogar', 'belleza'].includes(b.categorias?.slug),
  },
]

function toMapPercent(lat, lng) {
  const minLat = -34.48
  const maxLat = -34.44
  const minLng = -58.98
  const maxLng = -58.9
  const x = ((lng - minLng) / (maxLng - minLng)) * 100
  const y = ((maxLat - lat) / (maxLat - minLat)) * 100
  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(88, Math.max(12, y)),
  }
}

export default function MapExplorer({ businesses = [] }) {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [selected, setSelected] = useState(null)

  const pins = useMemo(() => {
    const withCoords = businesses.filter((b) => b.lat != null && b.lng != null)
    if (activeFilter === 'todos') return withCoords
    const filter = mapFilters.find((item) => item.id === activeFilter)
    if (!filter) return withCoords
    return withCoords.filter(filter.match)
  }, [activeFilter, businesses])

  const selectedBusiness = selected ? businesses.find((b) => b.id === selected) : null

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="rounded-[1.5rem] border border-line/70 bg-white p-5 shadow-soft md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Mapa</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Explorá Pilar</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">Encontrá lugares cerca tuyo.</p>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={() => {
              setActiveFilter('todos')
              setSelected(null)
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
              activeFilter === 'todos'
                ? 'bg-teal text-white'
                : 'bg-paper text-ink-soft hover:bg-paper-deep'
            }`}
          >
            <span aria-hidden>📍</span>
            Todos
          </button>
          {mapFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                setActiveFilter(filter.id)
                setSelected(null)
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                activeFilter === filter.id
                  ? 'bg-teal text-white'
                  : 'bg-paper text-ink-soft hover:bg-paper-deep'
              }`}
            >
              <span aria-hidden>{filter.emoji}</span>
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">En el mapa</p>
          <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
            {pins.map((business) => (
              <li key={business.id}>
                <button
                  type="button"
                  onClick={() => setSelected(business.id)}
                  className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                    selected === business.id ? 'bg-teal-soft text-teal-dark' : 'hover:bg-paper'
                  }`}
                >
                  <p className="text-sm font-semibold">{business.nombre}</p>
                  <p className="text-xs text-muted">
                    {business.subcategoria || business.categorias?.nombre}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] border border-line/70 shadow-soft md:min-h-[640px]">
        <div className="map-grid absolute inset-0" />

        <div
          className="absolute left-[8%] top-[46%] h-[3px] w-[84%] -rotate-6 bg-white/80"
          aria-hidden
        />
        <div
          className="absolute left-[30%] top-[10%] h-[80%] w-[3px] rotate-12 bg-white/70"
          aria-hidden
        />
        <div
          className="absolute left-[10%] top-[68%] h-[3px] w-[70%] rotate-3 bg-white/60"
          aria-hidden
        />
        <div
          className="absolute bottom-8 left-8 rounded-xl bg-white/90 px-3 py-2 text-xs font-semibold text-ink-soft shadow-soft backdrop-blur"
          aria-hidden
        >
          Pilar · Zona norte
        </div>

        {pins.map((business) => {
          const { x, y } = toMapPercent(Number(business.lat), Number(business.lng))
          return (
            <button
              key={business.id}
              type="button"
              onClick={() => setSelected(business.id)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-full transition ${
                selected === business.id ? 'z-20 scale-110' : 'z-10 hover:scale-105'
              }`}
              aria-label={business.nombre}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lift ${
                  selected === business.id ? 'bg-teal text-white' : 'bg-ink text-white'
                }`}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <span
                className={`mx-auto mt-[-2px] block h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent ${
                  selected === business.id ? 'border-t-teal' : 'border-t-ink'
                }`}
              />
            </button>
          )
        })}

        {selectedBusiness ? (
          <div className="absolute inset-x-3 bottom-3 z-30 md:inset-x-auto md:bottom-6 md:left-6 md:w-[340px]">
            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
              <div className="relative aspect-[16/9] bg-paper-deep">
                {principalFoto(selectedBusiness) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={principalFoto(selectedBusiness)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                      {selectedBusiness.subcategoria || selectedBusiness.categorias?.nombre}
                    </p>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      {selectedBusiness.nombre}
                    </h2>
                  </div>
                  {selectedBusiness.rating > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                      {selectedBusiness.rating}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted">{selectedBusiness.localidad || 'Pilar'}</p>
                <Link
                  href={`/negocio/${selectedBusiness.slug}`}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
                >
                  Ver perfil
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
