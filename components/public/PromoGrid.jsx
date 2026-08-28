import Link from 'next/link'
import PromoPlaceholderCard from '@/components/public/PromoPlaceholderCard'
import { padWithPromoPlaceholders } from '@/lib/placeholders'
import { formatDate } from '@/lib/utils'

export default function PromoGrid({
  promociones = [],
  minSlots = 3,
  className = 'grid gap-4 md:grid-cols-3',
  linkToListing = false,
}) {
  const targetCount = promociones.length ? Math.max(promociones.length, minSlots) : minSlots
  const items = padWithPromoPlaceholders(promociones, targetCount)

  return (
    <div className={className}>
      {items.map((item) => {
        if (item.kind === 'placeholder') {
          return (
            <PromoPlaceholderCard
              key={item.key}
              title={item.copy.title}
              text={item.copy.text}
            />
          )
        }

        const promo = item.promo
        const negocioSlug = promo.negocios?.slug
        const negocioNombre = promo.negocios?.nombre
        const href = linkToListing ? '/promociones' : negocioSlug ? `/negocio/${negocioSlug}` : '/promociones'

        const card = (
          <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:shadow-lift">
            <div className="aspect-[16/9] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={promo.imagen}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              {promo.descuento ? (
                <span className="inline-flex w-fit rounded-md bg-amber-soft px-2 py-1 text-xs font-bold text-amber">
                  {promo.descuento}
                </span>
              ) : null}
              {negocioNombre ? (
                <p className={`text-xs font-semibold uppercase tracking-[0.12em] text-teal ${promo.descuento ? 'mt-3' : ''}`}>
                  {negocioNombre}
                </p>
              ) : null}
              <h3 className="mt-3 font-display text-xl font-semibold text-ink">{promo.titulo}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{promo.descripcion}</p>
              <p className="mt-3 text-xs font-medium text-ink-soft">
                Válido hasta {formatDate(promo.valido_hasta)}
              </p>
              {!linkToListing && negocioSlug ? (
                <span className="mt-5 inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">
                  Ver promoción
                </span>
              ) : null}
            </div>
          </article>
        )

        if (linkToListing) {
          return (
            <Link key={promo.id} href={href} className="block transition hover:-translate-y-0.5">
              {card}
            </Link>
          )
        }

        return negocioSlug ? (
          <Link key={promo.id} href={href} className="block transition hover:-translate-y-0.5">
            {card}
          </Link>
        ) : (
          <div key={promo.id}>{card}</div>
        )
      })}
    </div>
  )
}
