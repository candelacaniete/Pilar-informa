import Link from 'next/link'
import { AlertTriangle, Building2, CalendarClock, Newspaper, Plus } from 'lucide-react'
import { getAdminDashboardStats } from '@/lib/data'

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats()

  const cards = [
    {
      label: 'Negocios activos',
      value: stats.activos,
      hint: 'Aparecen en la guía pública',
      icon: Building2,
      color: 'bg-teal-soft text-teal-dark',
    },
    {
      label: 'Por vencer esta semana',
      value: stats.porVencerSemana,
      hint: 'Contactalos para renovar',
      icon: AlertTriangle,
      color: 'bg-danger-soft text-danger',
    },
    {
      label: 'Por vencer este mes',
      value: stats.porVencerMes,
      hint: 'Próximos 30 días',
      icon: CalendarClock,
      color: 'bg-amber-soft text-amber',
    },
    {
      label: 'Planes vencidos',
      value: stats.vencidos,
      hint: 'Ya no deberían estar activos',
      icon: Newspaper,
      color: 'bg-slate-200 text-slate-700',
    },
  ]

  return (
    <div className="admin-page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Hola 👋</h1>
          <p className="mt-1 text-slate-600">
            Resumen rápido de lo que hay en Pilar Informa.
          </p>
        </div>
        <Link
          href="/admin/negocios/nuevo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          <Plus className="h-4 w-4" />
          Cargar un negocio
        </Link>
      </div>

      {stats.usingMock && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Estás viendo datos de ejemplo. Cuando configures Supabase, acá vas a ver la información
          real.
        </div>
      )}

      <div className="admin-cards mt-6">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className={`inline-flex rounded-xl p-2.5 ${card.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{card.label}</p>
              <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
            </div>
          )
        })}
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">Últimas noticias</h2>
          <Link href="/admin/noticias" className="text-sm font-semibold text-teal hover:underline">
            Ver todas
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-slate-100">
          {(stats.ultimasNoticias || []).map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium text-slate-900">{n.titulo}</p>
                <p className="text-xs text-slate-500">
                  {n.estado === 'publicado' ? 'Publicada' : 'Borrador'}
                </p>
              </div>
            </li>
          ))}
          {!stats.ultimasNoticias?.length && (
            <li className="py-6 text-sm text-slate-500">Todavía no hay noticias cargadas.</li>
          )}
        </ul>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/admin/noticias/nueva" label="Nueva noticia" />
        <QuickLink href="/admin/eventos/nuevo" label="Nuevo evento" />
        <QuickLink href="/admin/promociones/nueva" label="Nueva promoción" />
        <QuickLink href="/admin/farmacias/nuevo" label="Turno de farmacia" />
      </section>
    </div>
  )
}

function QuickLink({ href, label }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-700 transition hover:border-teal hover:text-teal"
    >
      + {label}
    </Link>
  )
}
