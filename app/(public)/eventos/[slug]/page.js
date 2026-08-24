import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Clock, MapPin } from 'lucide-react'
import { getEventoBySlug, getEventos } from '@/lib/data'
import { formatDate, formatShortDate } from '@/lib/utils'
import { buildPageMetadata, eventJsonLd } from '@/lib/seo/metadata'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)
  if (!evento) return { title: 'Evento no encontrado' }
  return buildPageMetadata({
    title: evento.titulo,
    description: evento.descripcion,
    path: `/eventos/${evento.slug}`,
    image: evento.imagen,
  })
}

export default async function EventoDetallePage({ params }) {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)
  if (!evento) notFound()

  const otros = (await getEventos({ fromToday: true, limit: 4 }))
    .filter((e) => e.id !== evento.id)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(evento)) }}
      />

      <Link
        href="/agenda"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la agenda
      </Link>

      {evento.imagen ? (
        <div className="overflow-hidden rounded-[1.5rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={evento.imagen} alt={evento.titulo} className="aspect-[16/9] w-full object-cover" />
        </div>
      ) : null}

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        {evento.categoria || 'Evento'}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
        {evento.titulo}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{evento.descripcion}</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line/70 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Fecha
          </p>
          <p className="mt-2 text-sm font-medium text-ink">{formatShortDate(evento.fecha)}</p>
          <p className="text-xs text-muted">{formatDate(evento.fecha)}</p>
        </div>
        <div className="rounded-2xl border border-line/70 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            <Clock className="h-3.5 w-3.5" />
            Horario
          </p>
          <p className="mt-2 text-sm font-medium text-ink">{evento.hora || 'A confirmar'}</p>
        </div>
        <div className="rounded-2xl border border-line/70 bg-white p-4">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
            <MapPin className="h-3.5 w-3.5" />
            Lugar
          </p>
          <p className="mt-2 text-sm font-medium text-ink">{evento.ubicacion}</p>
          <p className="text-xs text-muted">{evento.localidad}</p>
        </div>
      </div>

      {otros.length > 0 ? (
        <section className="mt-14 border-t border-line/70 pt-10">
          <h2 className="font-display text-2xl font-semibold text-ink">Más en la agenda</h2>
          <ul className="mt-5 space-y-3">
            {otros.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/eventos/${item.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-white px-4 py-3 transition hover:border-teal/25 hover:shadow-soft"
                >
                  <span className="font-medium text-ink">{item.titulo}</span>
                  <span className="shrink-0 text-xs text-muted">{formatShortDate(item.fecha)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
