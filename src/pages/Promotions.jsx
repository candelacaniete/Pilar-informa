import { Link } from 'react-router-dom'
import { Tag } from 'lucide-react'
import Seo from '../components/Seo'
import { promotions } from '../data/promotions'

export default function Promotions() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Seo
        title="Promociones de comercios en Pilar"
        description="Descuentos y beneficios de comercios locales de Pilar. Presentá la promo desde Guía Pilar."
        path="/promociones"
      />
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Beneficios</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Promociones en Pilar
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Descuentos y beneficios de comercios locales. Presentá la promo desde Guía Pilar.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => (
          <article
            key={promo.id}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={promo.image}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-soft px-2.5 py-1 text-xs font-bold text-amber">
                <Tag className="h-3.5 w-3.5" />
                {promo.discount}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                {promo.businessName}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold text-ink">{promo.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{promo.description}</p>
              <p className="mt-4 text-xs font-medium text-ink-soft">{promo.expires}</p>
              <Link
                to={`/negocio/${promo.businessSlug}`}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
              >
                Ver promoción
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
