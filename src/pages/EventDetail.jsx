import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Clock, MapPin } from 'lucide-react'
import Seo from '../components/Seo'
import JsonLd from '../components/JsonLd'
import { getEventBySlug } from '../data/events'
import { getShareEntity } from '../seo/lookup'
import { eventJsonLd } from '../seo/schema'

export default function EventDetail() {
  const { slug } = useParams()
  const item = getEventBySlug(slug)
  const share = getShareEntity('eventos', slug)

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <Seo
          title={share.title}
          description={share.description}
          path={share.path}
          image={share.image}
        />
        <h1 className="font-display text-3xl font-semibold">Evento no encontrado</h1>
        <p className="mt-3 text-muted">Ese evento no está en la agenda.</p>
        <Link to="/eventos" className="mt-6 inline-flex text-sm font-semibold text-teal">
          Volver a la agenda
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Seo
        title={share.title}
        description={share.description}
        path={share.path}
        image={share.image}
      />
      <JsonLd data={eventJsonLd(item)} />

      <Link
        to="/eventos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Toda la agenda
      </Link>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Evento</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
        {item.title}
      </h1>

      <div className="mt-8 overflow-hidden rounded-[1.5rem]">
        <img src={item.image} alt={item.title} className="h-auto w-full object-cover" />
      </div>

      <p className="mt-8 text-lg leading-relaxed text-ink-soft">{item.description}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Info icon={CalendarDays} label="Cuándo" value={item.dateLabel} />
        <Info icon={Clock} label="Horario" value={item.time} />
        <Info icon={MapPin} label="Dónde" value={`${item.location} · ${item.locality}`} />
      </div>
    </article>
  )
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{value}</p>
    </div>
  )
}
