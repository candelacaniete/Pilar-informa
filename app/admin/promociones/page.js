import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllPromocionesAdmin } from '@/lib/data'
import { estadoLabel } from '@/lib/utils'

function EstadoBadge({ estado }) {
  const styles =
    estado === 'activa'
      ? 'bg-teal-soft text-teal-dark'
      : estado === 'pausada'
        ? 'bg-amber-soft text-amber'
        : 'bg-slate-100 text-slate-700'

  return (
    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {estadoLabel(estado)}
    </span>
  )
}

export default async function AdminPromocionesPage() {
  const promociones = await getAllPromocionesAdmin()

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Promociones</h1>
          <p className="mt-1 text-slate-600">Ofertas y descuentos de los comercios.</p>
        </div>
        <Link
          href="/admin/promociones/nueva"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Nueva promoción
        </Link>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {promociones.length} {promociones.length === 1 ? 'promoción' : 'promociones'}
      </p>

      <div className="mt-4 grid gap-4">
        {promociones.map((p) => (
          <article
            key={p.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
              {p.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imagen} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-slate-900">{p.titulo}</h2>
                <EstadoBadge estado={p.estado} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {p.negocios?.nombre || 'Sin negocio'}
                {p.descuento ? ` · ${p.descuento}` : ''}
              </p>
              {(p.valido_desde || p.valido_hasta) && (
                <p className="mt-1 text-xs text-slate-500">
                  {p.valido_desde || '—'} → {p.valido_hasta || '—'}
                </p>
              )}
            </div>
            <Link
              href={`/admin/promociones/${p.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal"
            >
              Editar
            </Link>
          </article>
        ))}

        {!promociones.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">Todavía no hay promociones</p>
            <p className="mt-1 text-sm text-slate-500">Cargá la primera oferta de un negocio.</p>
          </div>
        )}
      </div>
    </div>
  )
}
