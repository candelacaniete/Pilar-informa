import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Star, X } from 'lucide-react'
import { businesses } from '../data/businesses'
import { mapFilters } from '../data/categories'

export default function MapPage() {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [selected, setSelected] = useState(null)

  const pins = useMemo(() => {
    if (activeFilter === 'todos') return businesses
    const filter = mapFilters.find((item) => item.id === activeFilter)
    if (!filter) return businesses
    if (filter.id === 'eventos') return businesses.filter((b) => b.featured).slice(0, 4)
    return businesses.filter((b) => b.category === filter.category || b.subcategory.includes(filter.label))
  }, [activeFilter])

  const selectedBusiness = selected ? businesses.find((b) => b.id === selected) : null

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-[1.5rem] border border-line/70 bg-white p-5 shadow-soft md:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Mapa</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Explorá Pilar</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Encontrá lugares cerca tuyo.
          </p>

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
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
              En el mapa
            </p>
            <ul className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
              {pins.map((business) => (
                <li key={business.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(business.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                      selected === business.id
                        ? 'bg-teal-soft text-teal-dark'
                        : 'hover:bg-paper'
                    }`}
                  >
                    <p className="text-sm font-semibold">{business.name}</p>
                    <p className="text-xs text-muted">{business.subcategory}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="relative min-h-[520px] overflow-hidden rounded-[1.5rem] border border-line/70 shadow-soft md:min-h-[640px]">
          <div className="map-grid absolute inset-0" />

          {/* Stylized roads */}
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

          {pins.map((business) => (
            <button
              key={business.id}
              type="button"
              onClick={() => setSelected(business.id)}
              style={{ left: `${business.mapX}%`, top: `${business.mapY}%` }}
              className={`absolute -translate-x-1/2 -translate-y-full transition ${
                selected === business.id ? 'z-20 scale-110' : 'z-10 hover:scale-105'
              }`}
              aria-label={business.name}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lift ${
                  selected === business.id ? 'bg-teal text-white' : 'bg-ink text-white'
                }`}
              >
                <MapPin className="h-4 w-4" />
              </span>
              <span className="mx-auto mt-[-2px] block h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-ink" />
            </button>
          ))}

          {selectedBusiness && (
            <div className="absolute inset-x-3 bottom-3 z-30 md:inset-x-auto md:bottom-6 md:left-6 md:w-[340px]">
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-lift">
                <div className="relative aspect-[16/9]">
                  <img
                    src={selectedBusiness.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
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
                        {selectedBusiness.subcategory}
                      </p>
                      <h2 className="font-display text-xl font-semibold text-ink">
                        {selectedBusiness.name}
                      </h2>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                      {selectedBusiness.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{selectedBusiness.locality}</p>
                  <Link
                    to={`/negocio/${selectedBusiness.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
