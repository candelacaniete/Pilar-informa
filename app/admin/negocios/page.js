import Link from 'next/link'
import { Suspense } from 'react'
import { Plus, Search } from 'lucide-react'
import { getAllNegociosAdmin, getCategorias } from '@/lib/data'
import { estadoLabel, planLabel, principalFoto } from '@/lib/utils'
import ExpiryBadge from '@/components/admin/ExpiryBadge'
import NegociosFilters from '@/components/admin/NegociosFilters'

export default async function AdminNegociosPage({ searchParams }) {
  const params = await searchParams
  const q = (params.q || '').toLowerCase()
  const categoria = params.categoria || 'todas'
  const estado = params.estado || 'todos'

  const [negocios, categorias] = await Promise.all([getAllNegociosAdmin(), getCategorias()])

  const filtered = negocios.filter((n) => {
    const haystack = `${n.nombre} ${n.subcategoria || ''} ${n.localidad || ''}`.toLowerCase()
    const matchQ = !q || haystack.includes(q)
    const matchCat = categoria === 'todas' || n.categoria_id === categoria || n.categorias?.slug === categoria
    const matchEstado = estado === 'todos' || n.estado === estado
    return matchQ && matchCat && matchEstado
  })

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Negocios</h1>
          <p className="mt-1 text-slate-600">Cargá y renová los comercios que pagan por aparecer.</p>
        </div>
        <Link
          href="/admin/negocios/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo negocio
        </Link>
      </div>

      <Suspense fallback={<div className="mt-6 h-28 animate-pulse rounded-2xl bg-white" />}>
        <NegociosFilters categorias={categorias} />
      </Suspense>

      <p className="mt-5 text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? 'negocio' : 'negocios'}
      </p>

      <div className="mt-4 grid gap-4">
        {filtered.map((n) => {
          const foto = principalFoto(n)
          return (
            <article
              key={n.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-slate-900">{n.nombre}</h2>
                  <ExpiryBadge planVence={n.plan_vence} estado={n.estado} />
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {n.categorias?.nombre || 'Sin categoría'}
                  {n.localidad ? ` · ${n.localidad}` : ''}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Plan {planLabel(n.plan)} · {estadoLabel(n.estado)}
                </p>
              </div>
              <Link
                href={`/admin/negocios/${n.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal"
              >
                Editar
              </Link>
            </article>
          )
        })}

        {!filtered.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Search className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-3 font-semibold text-slate-800">No hay negocios con ese filtro</p>
            <p className="mt-1 text-sm text-slate-500">Probá sacar filtros o cargá uno nuevo.</p>
          </div>
        )}
      </div>
    </div>
  )
}
