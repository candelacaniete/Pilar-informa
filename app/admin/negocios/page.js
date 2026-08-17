import Link from 'next/link'
import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { getAllNegociosAdmin, getCategorias } from '@/lib/data'
import NegociosFilters from '@/components/admin/NegociosFilters'
import NegociosList from '@/components/admin/NegociosList'

export default async function AdminNegociosPage({ searchParams }) {
  const params = await searchParams
  const q = (params.q || '').toLowerCase()
  const categoria = params.categoria || 'todas'
  const estado = params.estado || 'todos'

  const [negocios, categorias] = await Promise.all([getAllNegociosAdmin(), getCategorias()])

  const filtered = negocios.filter((n) => {
    const haystack = `${n.nombre} ${n.subcategoria || ''} ${n.localidad || ''}`.toLowerCase()
    const matchQ = !q || haystack.includes(q)
    const matchCat =
      categoria === 'todas' || n.categoria_id === categoria || n.categorias?.slug === categoria
    const matchEstado = estado === 'todos' || n.estado === estado
    return matchQ && matchCat && matchEstado
  })

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Negocios</h1>
          <p className="mt-1 text-slate-600">
            Cargá comercios y decidí el orden con Subir / Bajar (o el número de orden en el
            formulario).
          </p>
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
        {categoria !== 'todas' ? ' · orden de esta categoría' : ''}
      </p>

      <NegociosList negocios={filtered} categoriaFiltro={categoria} />
    </div>
  )
}
