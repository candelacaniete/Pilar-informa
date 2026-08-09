import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllEventosAdmin } from '@/lib/data'

export default async function AdminEventosPage() {
  const eventos = await getAllEventosAdmin()

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Eventos</h1>
          <p className="mt-1 text-slate-600">Agenda de actividades y eventos del partido.</p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo evento
        </Link>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
      </p>

      <div className="mt-4 grid gap-4">
        {eventos.map((e) => (
          <article
            key={e.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
              {e.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.imagen} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-slate-900">{e.titulo}</h2>
                {e.categoria ? (
                  <span className="inline-flex rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {e.categoria}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {e.fecha}
                {e.hora ? ` · ${e.hora}` : ''}
                {e.ubicacion ? ` · ${e.ubicacion}` : ''}
              </p>
              {e.localidad ? <p className="mt-1 text-xs text-slate-500">{e.localidad}</p> : null}
            </div>
            <Link
              href={`/admin/eventos/${e.id}`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal"
            >
              Editar
            </Link>
          </article>
        ))}

        {!eventos.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">Todavía no hay eventos</p>
            <p className="mt-1 text-sm text-slate-500">Cargá el primero para armar la agenda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
