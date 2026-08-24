import Link from 'next/link'
import { Tag } from 'lucide-react'
import { getPromociones } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Promociones de comercios en Pilar',
  description:
    'Descuentos y beneficios de comercios locales de Pilar. Presentá la promo desde Guía Pilar.',
  path: '/promociones',
})

export default async function PromocionesPage() {
  const promociones = await getPromociones()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
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
        {promociones.map((promo) => {
          const negocioSlug = promo.negocios?.slug
          const negocioNombre = promo.negocios?.nombre
          return (
            <article
              key={promo.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={promo.imagen}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-soft px-2.5 py-1 text-xs font-bold text-amber">
                  <Tag className="h-3.5 w-3.5" />
                  {promo.descuento}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                {negocioNombre ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                    {negocioNombre}
                  </p>
                ) : null}
                <h2 className="mt-2 font-display text-xl font-semibold text-ink">{promo.titulo}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{promo.descripcion}</p>
                <p className="mt-4 text-xs font-medium text-ink-soft">
                  Válido hasta {formatDate(promo.valido_hasta)}
                </p>
                {negocioSlug ? (
                  <Link
                    href={`/negocio/${negocioSlug}`}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
                  >
                    Ver promoción
                  </Link>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>

      {promociones.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">No hay promociones activas</p>
        </div>
      ) : null}
    </div>
  )
}
