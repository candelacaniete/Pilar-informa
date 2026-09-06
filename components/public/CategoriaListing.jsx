'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import BusinessSlot from '@/components/public/BusinessSlot'
import BannerSlot from '@/components/public/BannerSlot'
import { getBannerSlot } from '@/lib/banners'
import { padWithBusinessPlaceholders } from '@/lib/placeholders'
import {
  filterNegociosByTipoYZona,
  subcategoriasPresentes,
  zonasPresentes,
} from '@/lib/subcategorias'
import { ZONAS_PILAR } from '@/lib/zonas'

function parseList(value) {
  if (!value) return []
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition ${
        active
          ? 'border-teal bg-teal text-white'
          : 'border-line bg-white text-ink-soft hover:border-teal/30 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function CategoriaListing({
  categoriaSlug,
  negocios = [],
  bannerSlots = [],
  showBanners = false,
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const tipos = useMemo(() => parseList(searchParams.get('tipo')), [searchParams])
  const zonas = useMemo(() => parseList(searchParams.get('zona')), [searchParams])

  const tipoOptions = useMemo(
    () => subcategoriasPresentes(negocios, categoriaSlug),
    [negocios, categoriaSlug],
  )
  const zonaOptions = useMemo(() => zonasPresentes(negocios, ZONAS_PILAR), [negocios])

  const filtered = useMemo(
    () => filterNegociosByTipoYZona(negocios, { tipos, zonas }),
    [negocios, tipos, zonas],
  )

  const gridTarget = filtered.length >= 3 ? filtered.length : filtered.length > 0 ? 3 : 0
  const gridItems = padWithBusinessPlaceholders(filtered, gridTarget)
  const mid = Math.ceil(gridItems.length / 2)
  const firstHalf = gridItems.slice(0, mid)
  const secondHalf = gridItems.slice(mid)

  const updateParams = (nextTipos, nextZonas) => {
    const params = new URLSearchParams()
    if (nextTipos.length) params.set('tipo', nextTipos.join(','))
    if (nextZonas.length) params.set('zona', nextZonas.join(','))
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const hasFilters = tipos.length > 0 || zonas.length > 0
  const showTipoFilters = tipoOptions.length > 0
  const showZonaFilters = zonaOptions.length > 0

  return (
    <div>
      {showTipoFilters || showZonaFilters ? (
        <div className="mt-8 space-y-5">
          {showTipoFilters ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Filtrar por tipo
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={tipos.length === 0} onClick={() => updateParams([], zonas)}>
                  Todos
                </FilterChip>
                {tipoOptions.map((tipo) => (
                  <FilterChip
                    key={tipo}
                    active={tipos.includes(tipo)}
                    onClick={() => updateParams(toggleInList(tipos, tipo), zonas)}
                  >
                    {tipo}
                  </FilterChip>
                ))}
              </div>
            </div>
          ) : null}

          {showZonaFilters ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Filtrar por zona
              </p>
              <div className="flex flex-wrap gap-2">
                <FilterChip active={zonas.length === 0} onClick={() => updateParams(tipos, [])}>
                  Todas
                </FilterChip>
                {zonaOptions.map((zona) => (
                  <FilterChip
                    key={zona}
                    active={zonas.includes(zona)}
                    onClick={() => updateParams(tipos, toggleInList(zonas, zona))}
                  >
                    {zona}
                  </FilterChip>
                ))}
              </div>
            </div>
          ) : null}

          {hasFilters ? (
            <p className="text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? 'lugar' : 'lugares'}
              {tipos.length ? ` · ${tipos.join(', ')}` : ''}
              {zonas.length ? ` · ${zonas.join(', ')}` : ''}
            </p>
          ) : null}
        </div>
      ) : null}

      {showBanners ? (
        <div className="mt-8">
          <BannerSlot {...getBannerSlot(bannerSlots, 1)} />
        </div>
      ) : null}

      {filtered.length > 0 ? (
        <>
          <div
            className={`${showTipoFilters || showZonaFilters ? 'mt-6' : 'mt-10'} grid gap-5 sm:grid-cols-2 lg:grid-cols-3`}
          >
            {firstHalf.map((item) => (
              <BusinessSlot
                key={item.kind === 'business' ? item.business.id : item.key}
                item={item}
              />
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
                <BusinessSlot
                  key={item.kind === 'business' ? item.business.id : item.key}
                  item={item}
                />
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
          <div className="mt-10 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
            <p className="font-display text-2xl font-semibold text-ink">
              {negocios.length === 0 ? 'Todavía no hay negocios' : 'Sin resultados con esos filtros'}
            </p>
            <p className="mt-2 text-sm text-muted">
              {negocios.length === 0
                ? 'Volvé pronto o explorá otra categoría.'
                : 'Probá sacar algún filtro de tipo o zona.'}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => updateParams([], [])}
                className="mt-6 inline-flex text-sm font-semibold text-teal"
              >
                Limpiar filtros
              </button>
            ) : negocios.length === 0 ? (
              <a href="/guia" className="mt-6 inline-flex text-sm font-semibold text-teal">
                Ir a la guía
              </a>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
