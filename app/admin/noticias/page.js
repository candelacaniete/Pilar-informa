import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllNoticiasAdmin } from '@/lib/data'
import { estadoLabel } from '@/lib/utils'

function EstadoBadge({ estado }) {
  const styles =
    estado === 'publicado'
      ? 'bg-teal-soft text-teal-dark'
      : estado === 'borrador'
        ? 'bg-slate-100 text-slate-700'
        : 'bg-amber-soft text-amber'

  return (
    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {estadoLabel(estado)}
    </span>
  )
}

export default async function AdminNoticiasPage() {
  const noticias = await getAllNoticiasAdmin()

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Noticias</h1>
          <p className="mt-1 text-slate-600">Publicá y editá las notas del portal.</p>
        </div>
        <Link
          href="/admin/noticias/nueva"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Nueva noticia
        </Link>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {noticias.length} {noticias.length === 1 ? 'noticia' : 'noticias'}
      </p>

      <div className="mt-4 grid gap-4">
        {noticias.map((n) => (
          <article
            key={n.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
              {n.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={n.imagen} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-slate-900">{n.titulo}</h2>
                <EstadoBadge estado={n.estado} />
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {n.categoria || 'Sin categoría'}
                {n.autor ? ` · ${n.autor}` : ''}
              </p>
            </div>
            <Link
              href={`/admin/noticias/${n.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal"
            >
              Editar
            </Link>
          </article>
        ))}

        {!noticias.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">Todavía no hay noticias</p>
            <p className="mt-1 text-sm text-slate-500">Cargá la primera para empezar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
