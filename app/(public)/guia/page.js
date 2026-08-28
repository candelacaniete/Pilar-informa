import Link from 'next/link'
import SearchBar from '@/components/public/SearchBar'
import BusinessSlot from '@/components/public/BusinessSlot'
import BannerSlot from '@/components/public/BannerSlot'
import { getBannersForMonth, getCategorias, getNegociosActivos } from '@/lib/data'
import { emptyCategoriaSlots, getBannerSlot } from '@/lib/banners'
import { padWithBusinessPlaceholders } from '@/lib/placeholders'
import { buildPageMetadata } from '@/lib/seo/metadata'

export const metadata = buildPageMetadata({
  title: 'Guía de comercios, profesionales y servicios en Pilar',
  description:
    'Buscá restaurantes, peluquerías, veterinarias, farmacias, oficios y profesionales de Pilar, Del Viso, Derqui y alrededores.',
  path: '/guia',
})

export default async function GuiaPage({ searchParams }) {
  const params = await searchParams
  const q = (params?.q || '').trim()
  const categoriaParam = (params?.categoria || '').trim()

  const [categorias, negocios] = await Promise.all([getCategorias(), getNegociosActivos()])

  const categoriaActiva = categorias.find(
    (c) => c.slug === categoriaParam || c.nombre.toLowerCase() === categoriaParam.toLowerCase(),
  )

  const filtered = negocios.filter((business) => {
    const haystack = [
      business.nombre,
      business.subcategoria,
      business.descripcion_corta,
      business.descripcion_larga,
      business.localidad,
      business.categorias?.nombre,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesQuery = !q || haystack.includes(q.toLowerCase())
    const matchesCategoria =
      !categoriaParam ||
      business.categorias?.slug === categoriaActiva?.slug ||
      business.categorias?.nombre?.toLowerCase() === categoriaParam.toLowerCase() ||
      business.categorias?.slug === categoriaParam

    return matchesQuery && matchesCategoria
  })

  // 2 banners: por categoría filtrada, o slots "Todas" (house) en listado general.
  // Categorías cerradas no venden banners.
  const showBanners = !categoriaActiva?.cerrada
  const categoryBanners =
    showBanners && categoriaActiva
      ? await getBannersForMonth({ ubicacion: 'categoria', categoriaId: categoriaActiva.id })
      : []
  const bannerSlots = showBanners ? emptyCategoriaSlots(categoryBanners) : []

  const gridTarget = filtered.length >= 3 ? filtered.length : filtered.length > 0 ? 3 : 0
  const gridItems = padWithBusinessPlaceholders(filtered, gridTarget)
  const mid = Math.ceil(gridItems.length / 2)
  const firstHalf = gridItems.slice(0, mid)
  const secondHalf = gridItems.slice(mid)

  const buildHref = (slug) => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    if (slug) next.set('categoria', slug)
    const qs = next.toString()
    return qs ? `/guia?${qs}` : '/guia'
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Guía</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Guía de comercios y servicios en Pilar
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Directorio local de comercios, profesionales y oficios del partido de Pilar.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <SearchBar
          placeholder="Buscar comercio, profesional o servicio…"
          size="md"
          initialValue={q}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={buildHref(null)}
          className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
            !categoriaActiva
              ? 'border-teal bg-teal text-white'
              : 'border-line bg-white text-ink-soft hover:border-teal/30 hover:text-ink'
          }`}
        >
          Todas
        </Link>
        {categorias.map((cat) => {
          const active = categoriaActiva?.slug === cat.slug
          return (
            <Link
              key={cat.id}
              href={buildHref(cat.slug)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? 'border-teal bg-teal text-white'
                  : 'border-line bg-white text-ink-soft hover:border-teal/30 hover:text-ink'
              }`}
            >
              {cat.nombre}
            </Link>
          )
        })}
      </div>

      <div className="mt-8 flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">
          {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          {q ? ` para “${q}”` : ''}
          {categoriaActiva ? ` en ${categoriaActiva.nombre}` : ''}
        </p>
      </div>

      {showBanners ? (
        <div className="mt-6">
          <BannerSlot {...getBannerSlot(bannerSlots, 1)} />
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {firstHalf.map((item) => (
              <BusinessSlot key={item.kind === 'business' ? item.business.id : item.key} item={item} />
            ))}
          </div>

          {showBanners ? (
            <div className="my-8">
              <BannerSlot {...getBannerSlot(bannerSlots, 2)} />
            </div>
          ) : null}

          {secondHalf.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {secondHalf.map((item) => (
                <BusinessSlot key={item.kind === 'business' ? item.business.id : item.key} item={item} />
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <>
          {showBanners ? (
            <div className="mt-8">
              <BannerSlot {...getBannerSlot(bannerSlots, 2)} />
            </div>
          ) : null}
          <div className="mt-8 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold text-ink">No encontramos resultados</p>
            <p className="mt-2 text-sm text-muted">Probá con otra búsqueda o sacá algún filtro.</p>
          </div>
        </>
      )}
    </div>
  )
}
