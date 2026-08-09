import Link from 'next/link'
import { MapPin, MessageCircle, Star } from 'lucide-react'
import { principalFoto } from '@/lib/utils'

export default function BusinessCard({ business }) {
  const image = principalFoto(business)
  const wa = (business.whatsapp || '').replace(/\D/g, '')

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/80 bg-white shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper-deep">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={business.nombre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : null}
        {business.plan === 'premium' && (
          <span className="absolute left-3 top-3 rounded-md bg-amber-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber">
            Premium
          </span>
        )}
        {business.plan === 'destacado' && (
          <span className="absolute left-3 top-3 rounded-md bg-teal-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-dark">
            Destacado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
              {business.subcategoria || business.categorias?.nombre}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold text-ink">{business.nombre}</h3>
          </div>
          {business.rating > 0 && (
            <div className="inline-flex items-center gap-1 rounded-md bg-paper-deep px-2 py-1 text-xs font-semibold text-ink">
              <Star className="h-3.5 w-3.5 fill-amber text-amber" />
              {business.rating}
            </div>
          )}
        </div>

        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {business.localidad || 'Pilar'}
        </p>

        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft">
          {business.descripcion_corta || business.descripcion_larga}
        </p>

        <div className="mt-5 flex gap-2">
          <Link
            href={`/negocio/${business.slug}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-ink px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
          >
            Ver perfil
          </Link>
          {wa ? (
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line px-3 py-2.5 text-sm font-semibold text-ink transition hover:border-teal/40 hover:bg-teal-soft hover:text-teal-dark"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
