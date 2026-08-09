import Link from 'next/link'
import { CalendarDays, MapPin } from 'lucide-react'
import { getEventos } from '@/lib/data'
import { formatShortDate } from '@/lib/utils'

export const metadata = {
  title: 'Agenda',
  description: 'Qué hacer en Pilar: ferias, cultura, deporte y planes para armar tu semana.',
}

export default async function AgendaPage() {
  const eventos = await getEventos({ fromToday: true })

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

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((event) => (
          <Link
            key={event.id}
            href={`/eventos/${event.slug}`}
            className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <article>
              <div className="aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.imagen}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-teal">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatShortDate(event.fecha)}
                  </span>
                  <span className="inline-flex items-center gap-1 normal-case tracking-normal text-muted">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.ubicacion}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-semibold text-ink">{event.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{event.descripcion}</p>
                <p className="mt-4 text-xs font-medium text-ink-soft">
                  {event.hora} · {event.localidad}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {eventos.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">No hay eventos próximos</p>
          <p className="mt-2 text-sm text-muted">Volvé pronto para ver la agenda actualizada.</p>
        </div>
      ) : null}
    </div>
  )
}
