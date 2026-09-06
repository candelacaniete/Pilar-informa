import Link from 'next/link'
import { getClickMetricsAdmin } from '@/lib/data'

const RANGES = [
  { value: '7', label: 'Últimos 7 días' },
  { value: '30', label: 'Últimos 30 días' },
  { value: 'all', label: 'Todo' },
]

export default async function AdminMetricasPage({ searchParams }) {
  const params = await searchParams
  const range = ['7', '30', 'all'].includes(params?.rango) ? params.rango : '7'
  const rows = await getClickMetricsAdmin({ range })

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Métricas</h1>
          <p className="mt-1 text-slate-600">
            Clicks de contacto en fichas de negocio (uso interno). Cada tap cuenta, sin deduplicar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGES.map((item) => {
            const active = range === item.value
            return (
              <Link
                key={item.value}
                href={`/admin/metricas?rango=${item.value}`}
                className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-teal text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-teal hover:text-teal'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        {rows.length} {rows.length === 1 ? 'negocio' : 'negocios'} con clicks en el período
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Negocio</th>
              <th className="px-4 py-3 font-semibold">WhatsApp</th>
              <th className="px-4 py-3 font-semibold">Instagram</th>
              <th className="px-4 py-3 font-semibold">Facebook</th>
              <th className="px-4 py-3 font-semibold">Web</th>
              <th className="px-4 py-3 font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.negocio_id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  {row.slug ? (
                    <Link
                      href={`/negocio/${row.slug}`}
                      className="font-semibold text-slate-900 hover:text-teal"
                      target="_blank"
                    >
                      {row.nombre}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-900">{row.nombre}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{row.whatsapp}</td>
                <td className="px-4 py-3 text-slate-700">{row.instagram}</td>
                <td className="px-4 py-3 text-slate-700">{row.facebook}</td>
                <td className="px-4 py-3 text-slate-700">{row.web}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">{row.total}</td>
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  Todavía no hay clicks registrados en este período. Se cuentan al tocar WhatsApp,
                  Instagram, Facebook o Web en la ficha pública.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
