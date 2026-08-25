import Link from 'next/link'
import { Building2, ImageIcon, MessageSquare, Star } from 'lucide-react'
import { METRICS_LAYER, formatArs, PLAN_ORDER } from '@/lib/metrics/config'
import { planLabel } from '@/lib/utils'
import RevenueCalculator from '@/components/admin/RevenueCalculator'

const activityLabels = {
  negocio_alta: 'Alta de negocio',
  resena: 'Reseña nueva',
  banner: 'Banner vendido',
}

export default function MetricsDashboard({ metrics }) {
  if (!metrics) return null

  const op = metrics.operational
  const sales = metrics.sales

  return (
    <div className="mt-8 space-y-8">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Métricas</h2>
          <p className="text-sm text-slate-600">
            Mes de referencia: <span className="capitalize">{metrics.monthLabel}</span>
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Capas separadas: operación interna vs indicadores comerciales
        </p>
      </div>

      <MetricsLayer
        layer={METRICS_LAYER.OPERATIONAL}
        title="Operación interna"
        description="Vencimientos, gaps de contenido y ocupación detallada."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Desglose por plan (activos)" icon={Building2}>
            <PlanBars counts={op.negocios.porPlan} />
          </Panel>
          <Panel title="Por categoría (activos)" icon={Building2}>
            <CategoryTable rows={op.negocios.porCategoria} />
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Reseñas" icon={Star}>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <MetricItem label="Nuevas este mes" value={op.resenas.nuevasMes} />
              <MetricItem
                label="Promedio plataforma"
                value={op.resenas.promedio ? op.resenas.promedio.toFixed(1) : '—'}
              />
            </dl>
            <SinResenaList items={op.resenas.sinResena} />
          </Panel>
          <Panel title="Banners" icon={ImageIcon}>
            <BannerSummary banners={op.banners} />
          </Panel>
        </div>

        <Panel title="Actividad reciente" icon={MessageSquare}>
          <ActivityFeed items={op.actividad} />
        </Panel>
      </MetricsLayer>

      <MetricsLayer
        layer={METRICS_LAYER.SALES}
        title="Indicadores comerciales"
        description="Resumen exportable para argumentos de venta (solo admin por ahora)."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricItem label="Negocios activos" value={sales.negocios.activos} large />
          <MetricItem label="Reseñas del mes" value={sales.resenas.nuevasMes} large />
          <MetricItem
            label="Rating promedio"
            value={sales.resenas.promedio ? sales.resenas.promedio.toFixed(1) : '—'}
            large
          />
          <MetricItem label="Ocupación banners" value={sales.banners.ocupacionLabel} large />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-800">Mix de planes</p>
            <PlanBars counts={sales.negocios.porPlan} compact />
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm">
            <p className="font-semibold text-slate-800">Categorías</p>
            <p className="mt-2 text-slate-700">
              {sales.negocios.categoriasConNegocios} con negocios ·{' '}
              {sales.negocios.categoriasVacias} vacías
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Home {sales.banners.homePct}% ocupado · Categorías {sales.banners.categoriasPct}%
            </p>
          </div>
        </div>
      </MetricsLayer>

      <div data-metrics-layer={METRICS_LAYER.OPERATIONAL}>
        <RevenueCalculator {...metrics.calculator} />
      </div>
    </div>
  )
}

function MetricsLayer({ layer, title, description, children }) {
  return (
    <section data-metrics-layer={layer} className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{layer}</p>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  )
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-teal" /> : null}
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      {children}
    </div>
  )
}

function PlanBars({ counts = {}, compact = false }) {
  const total = PLAN_ORDER.reduce((s, p) => s + (counts[p] || 0), 0)
  if (!total) {
    return <p className="text-sm text-slate-500">Sin negocios activos.</p>
  }
  return (
    <ul className={compact ? 'space-y-2' : 'space-y-3'}>
      {PLAN_ORDER.map((plan) => {
        const n = counts[plan] || 0
        const pct = Math.round((n / total) * 100)
        return (
          <li key={plan}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">{planLabel(plan)}</span>
              <span className="text-slate-600">
                {n} ({pct}%)
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function CategoryTable({ rows = [] }) {
  if (!rows.length) {
    return <p className="text-sm text-slate-500">Sin categorías.</p>
  }
  return (
    <div className="max-h-64 overflow-y-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs text-slate-500">
            <th className="py-2 pr-3 font-semibold">Categoría</th>
            <th className="py-2 font-semibold">Activos</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-slate-100 ${row.activos === 0 ? 'bg-amber-50/60' : ''}`}
            >
              <td className="py-2 pr-3">
                <span className="mr-1" aria-hidden>
                  {row.icono}
                </span>
                {row.nombre}
              </td>
              <td className="py-2 font-semibold text-slate-800">{row.activos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BannerSummary({ banners }) {
  const { home, categorias, porCategoria, ingresosMes, preciosReferencia } = banners
  return (
    <div className="space-y-3 text-sm">
      <p>
        <strong>Home:</strong> {home.ocupados}/{home.total} slots
      </p>
      <p>
        <strong>Categorías:</strong> {categorias.ocupados}/{categorias.total} slots
      </p>
      <p className="text-slate-600">Facturación banners del mes: {formatArs(ingresosMes)}</p>
      {preciosReferencia ? (
        <p className="text-xs text-slate-500">
          Ref. {formatArs(preciosReferencia.home)} home ·{' '}
          {formatArs(preciosReferencia.categoria)} categoría
        </p>
      ) : null}
      {porCategoria?.length ? (
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-teal">Por categoría</summary>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-slate-600">
            {porCategoria.map((c) => (
              <li key={c.id}>
                {c.nombre}: {c.ocupados}/{c.total}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}

function SinResenaList({ items = [] }) {
  if (!items.length) {
    return <p className="mt-3 text-sm text-teal-dark">Todos los activos tienen al menos una reseña.</p>
  }
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Activos sin reseñas ({items.length}
        {items.length >= 20 ? '+' : ''})
      </p>
      <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-sm">
        {items.map((n) => (
          <li key={n.id}>
            <Link href={`/admin/negocios/${n.id}`} className="text-teal hover:underline">
              {n.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ActivityFeed({ items = [] }) {
  if (!items.length) {
    return <p className="text-sm text-slate-500">Sin actividad reciente.</p>
  }
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-start justify-between gap-3 py-3 text-sm">
          <div>
            <p className="font-medium text-slate-900">{item.title}</p>
            <p className="text-slate-600">
              {activityLabels[item.type] || item.type} · {item.detail}
            </p>
          </div>
          <time className="shrink-0 text-xs text-slate-500">
            {new Date(item.at).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'short',
              timeZone: 'America/Argentina/Buenos_Aires',
            })}
          </time>
        </li>
      ))}
    </ul>
  )
}

function MetricItem({ label, value, large = false }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 ${large ? 'text-2xl font-bold' : 'text-lg font-semibold'} text-slate-900`}>
        {value}
      </p>
    </div>
  )
}
