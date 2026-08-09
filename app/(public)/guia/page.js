import Link from 'next/link'
import SearchBar from '@/components/public/SearchBar'
import BusinessCard from '@/components/public/BusinessCard'
import { getCategorias, getNegociosActivos } from '@/lib/data'

export const metadata = {
  title: 'Guía de Pilar',
  description: 'Tu guía local de comercios, profesionales y servicios en Pilar.',
}

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
          Guía de Pilar
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Tu guía local de comercios, profesionales y servicios.
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

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-ink">No encontramos resultados</p>
          <p className="mt-2 text-sm text-muted">Probá con otra búsqueda o sacá algún filtro.</p>
        </div>
      )}
    </div>
  )
}
