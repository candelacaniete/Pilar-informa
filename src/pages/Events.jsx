import { useMemo, useState } from 'react'
import { CalendarDays, MapPin } from 'lucide-react'
import { events } from '../data/events'

const filters = [
  { id: 'todos', label: 'Todos' },
  { id: 'hoy', label: 'Hoy' },
  { id: 'esta-semana', label: 'Esta semana' },
  { id: 'fin-de-semana', label: 'Fin de semana' },
]

export default function Events() {
  const [active, setActive] = useState('todos')

  const filtered = useMemo(() => {
    if (active === 'todos') return events
    if (active === 'esta-semana') {
      return events.filter((event) =>
        ['hoy', 'esta-semana', 'fin-de-semana'].includes(event.dateFilter),
      )
    }
    return events.filter((event) => event.dateFilter === active)
  }, [active])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Agenda</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Qué hacer en Pilar
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Ferias, cultura, deporte y planes para armar tu semana.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setActive(filter.id)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === filter.id
                ? 'border-teal bg-teal text-white'
                : 'border-line bg-white text-ink-soft hover:border-teal/30'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event) => (
          <article
            key={event.id}
            className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={event.image}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {event.dateLabel}
                </span>
                <span className="inline-flex items-center gap-1 normal-case tracking-normal text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              </div>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink">{event.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{event.description}</p>
              <p className="mt-4 text-xs font-medium text-ink-soft">
                {event.time} · {event.locality}
              </p>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">No hay eventos en este filtro</p>
          <p className="mt-2 text-sm text-muted">Probá con otra fecha.</p>
        </div>
      )}
    </div>
  )
}
