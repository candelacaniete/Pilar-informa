import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import BusinessCard from '@/components/public/BusinessCard'
import { getCategoriaBySlug, getNegociosActivos } from '@/lib/data'
import { getCategoryAeo } from '@/lib/seo/categoryCopy'
import { buildPageMetadata, categoryCollectionJsonLd } from '@/lib/seo/metadata'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categoria = await getCategoriaBySlug(slug)
  if (!categoria) return { title: 'Categoría no encontrada' }
  const aeo = getCategoryAeo(categoria)
  return buildPageMetadata({
    title: aeo.shareTitle,
    description: aeo.description,
    path: `/categoria/${categoria.slug}`,
    image: aeo.image,
  })
}

export default async function CategoriaPage({ params }) {
  const { slug } = await params
  const categoria = await getCategoriaBySlug(slug)
  if (!categoria) notFound()

  const aeo = getCategoryAeo(categoria)
  const negocios = await getNegociosActivos({ categoriaSlug: slug })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categoryCollectionJsonLd(categoria, aeo, negocios)),
        }}
      />

      <Link
        href="/guia"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la guía
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            <span className="mr-2" aria-hidden>
              {categoria.icono}
            </span>
            {categoria.nombre}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {aeo.h1}
          </h1>
          <h2 className="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">{aeo.h2}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {aeo.description}
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            {negocios.length} {negocios.length === 1 ? 'lugar activo' : 'lugares activos'} en esta
            categoría.
          </p>
        </div>
        {aeo.image ? (
          <div className="overflow-hidden rounded-[1.5rem] border border-line/70">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aeo.image} alt={aeo.h1} className="h-56 w-full object-cover lg:h-full" />
          </div>
        ) : null}
      </div>

      {negocios.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {negocios.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-ink">Todavía no hay negocios</p>
          <p className="mt-2 text-sm text-muted">Volvé pronto o explorá otra categoría.</p>
          <Link href="/guia" className="mt-6 inline-flex text-sm font-semibold text-teal">
            Ir a la guía
          </Link>
        </div>
      )}
    </div>
  )
}
