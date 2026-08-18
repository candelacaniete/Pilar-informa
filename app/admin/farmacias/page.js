import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getAllFarmaciasTurnoAdmin } from '@/lib/data'
import { formatDate, todayInPilar } from '@/lib/utils'

export default async function AdminFarmaciasPage() {
  const turnos = await getAllFarmaciasTurnoAdmin()
  const today = todayInPilar()

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Farmacias de turno</h1>
          <p className="mt-1 text-slate-600">
            Cargá a mano qué farmacia cubre cada zona y cada día. Pilar usa esta lista para
            responder.
          </p>
        </div>
        <Link
          href="/admin/farmacias/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Nuevo turno
        </Link>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {turnos.length} {turnos.length === 1 ? 'turno' : 'turnos'} cargados
      </p>

      <div className="mt-4 grid gap-3">
        {turnos.map((turno) => {
          const esHoy = turno.fecha === today
          return (
            <article
              key={turno.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-slate-900">{turno.nombre}</h2>
                  {esHoy ? (
                    <span className="inline-flex rounded-lg bg-teal-soft px-2 py-0.5 text-xs font-semibold text-teal-dark">
                      Hoy
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {formatDate(turno.fecha)} · {turno.localidad} · {turno.horario}
                </p>
                {turno.direccion ? (
                  <p className="mt-0.5 text-xs text-slate-500">{turno.direccion}</p>
                ) : null}
              </div>
              <Link
                href={`/admin/farmacias/${turno.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal"
              >
                Editar
              </Link>
            </article>
          )
        })}

        {!turnos.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="font-semibold text-slate-800">Todavía no hay turnos</p>
            <p className="mt-1 text-sm text-slate-500">
              Cargá el primero para que Pilar pueda responder.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
