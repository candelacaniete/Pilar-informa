import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, SlidersHorizontal } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import BusinessCard from '../components/BusinessCard'
import { businesses } from '../data/businesses'
import { guideCategories, localities } from '../data/categories'

export default function Guide() {
  const [params, setParams] = useSearchParams()
  const initialQuery = params.get('q') || ''
  const initialCategory = params.get('categoria') || 'Todas'

  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(
    guideCategories.includes(initialCategory) ? initialCategory : 'Todas',
  )
  const [locality, setLocality] = useState('Todas')
  const [openNow, setOpenNow] = useState(false)
  const [withWhatsApp, setWithWhatsApp] = useState(false)
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const results = useMemo(() => {
    return businesses.filter((business) => {
      const haystack = `${business.name} ${business.category} ${business.subcategory} ${business.description} ${business.locality}`.toLowerCase()
      const matchesQuery = !query || haystack.includes(query.toLowerCase())
      const matchesCategory = category === 'Todas' || business.category === category
      const matchesLocality = locality === 'Todas' || business.locality === locality
      const matchesOpen = !openNow || business.openNow
      const matchesWhatsApp = !withWhatsApp || business.hasWhatsApp
      const matchesFeatured = !featuredOnly || business.featured
      return (
        matchesQuery &&
        matchesCategory &&
        matchesLocality &&
        matchesOpen &&
        matchesWhatsApp &&
        matchesFeatured
      )
    })
  }, [query, category, locality, openNow, withWhatsApp, featuredOnly])

  const handleSearch = (value) => {
    setQuery(value)
    const next = new URLSearchParams(params)
    if (value) next.set('q', value)
    else next.delete('q')
    setParams(next, { replace: true })
  }

  const toggleCategory = (name) => {
    setCategory(name)
    const next = new URLSearchParams(params)
    if (name === 'Todas') next.delete('categoria')
    else next.set('categoria', name)
    setParams(next, { replace: true })
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
          initialValue={initialQuery}
          onSearch={handleSearch}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {['Todas', ...guideCategories].map((name) => {
          const active = category === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => toggleCategory(name)}
              className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
                active
                  ? 'border-teal bg-teal text-white'
                  : 'border-line bg-white text-ink-soft hover:border-teal/30 hover:text-ink'
              }`}
            >
              {name}
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setFiltersOpen((value) => !value)}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm font-medium text-ink-soft transition hover:border-teal/30"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>

        {[
          { label: 'Abierto ahora', value: openNow, set: setOpenNow },
          { label: 'Con WhatsApp', value: withWhatsApp, set: setWithWhatsApp },
          { label: 'Destacados', value: featuredOnly, set: setFeaturedOnly },
        ].map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => filter.set((value) => !value)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition ${
              filter.value
                ? 'border-teal bg-teal-soft text-teal-dark'
                : 'border-line bg-white text-ink-soft hover:border-teal/30'
            }`}
          >
            {filter.value && <Check className="h-3.5 w-3.5" />}
            {filter.label}
          </button>
        ))}
      </div>

      {filtersOpen && (
        <div className="mt-4 rounded-2xl border border-line bg-white p-4 shadow-soft md:p-5">
          <label className="block text-sm font-medium text-ink">
            Localidad
            <select
              value={locality}
              onChange={(event) => setLocality(event.target.value)}
              className="mt-2 w-full max-w-xs rounded-xl border border-line bg-paper px-3 py-2.5 text-sm outline-none focus:border-teal/50"
            >
              <option value="Todas">Todas</option>
              {localities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="mt-8 flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">
          {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
          {query ? ` para “${query}”` : ''}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((business) => (
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
