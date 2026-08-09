import { Link } from 'react-router-dom'
import { MapPin, MessageCircle, Star } from 'lucide-react'

export default function BusinessCard({ business }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={business.image}
          alt={business.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {business.featured && (
          <span className="absolute left-3 top-3 rounded-md bg-amber-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber">
            Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
              {business.subcategory}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink">{business.name}</h3>
          </div>
          <div className="inline-flex items-center gap-1 rounded-md bg-paper-deep px-2 py-1 text-xs font-semibold text-ink">
            <Star className="h-3.5 w-3.5 fill-amber text-amber" />
            {business.rating}
          </div>
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {business.locality}
        </p>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft">
          {business.description}
        </p>

        <div className="mt-5 flex gap-2">
          <Link
            to={`/negocio/${business.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-ink px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
          >
            Ver perfil
          </Link>
          <a
            href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-teal/40 hover:bg-teal-soft hover:text-teal-dark"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}
