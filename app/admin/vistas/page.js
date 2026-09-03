import Link from 'next/link'
import { getPageViewsAdminSummary } from '@/lib/data'

export default async function AdminVistasPage() {
  const rows = await getPageViewsAdminSummary()

  return (
    <div className="admin-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Vistas</h1>
        <p className="mt-1 text-slate-600">
          Contador básico de visitas a fichas de negocios y mascotas (totales y últimos 7 días).
        </p>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Ficha</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Vistas totales</th>
              <th className="px-4 py-3 font-semibold">Últimos 7 días</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const href =
                row.entity_type === 'mascota'
                  ? `/mascotas/${row.entity_slug}`
                  : `/negocio/${row.entity_slug}`
              return (
                <tr key={`${row.entity_type}-${row.entity_id}`} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <Link href={href} className="font-semibold text-slate-900 hover:text-teal" target="_blank">
                      {row.entity_title || row.entity_slug || row.entity_id}
                    </Link>
                    {row.entity_slug ? (
                      <p className="text-xs text-slate-500">/{row.entity_slug}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">{row.entity_type}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.total}</td>
                  <td className="px-4 py-3 text-slate-700">{row.last7}</td>
                </tr>
              )
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-slate-500">
                  Todavía no hay vistas registradas. Se cuentan al abrir fichas públicas.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
