'use client'

import { useMemo, useState } from 'react'
import { calcBusinessesNeeded, formatArs, PLAN_ORDER, PLAN_PRICES_ARS } from '@/lib/metrics/config'

export default function RevenueCalculator({
  planPrices = PLAN_PRICES_ARS,
  mix,
  ingresosPlanesActivos = 0,
  ingresosBannersMes = 0,
  totalEstimadoMes = 0,
}) {
  const [targetInput, setTargetInput] = useState('')

  const target = useMemo(() => {
    const n = Number(String(targetInput).replace(/\D/g, ''))
    return Number.isFinite(n) && n > 0 ? n : 0
  }, [targetInput])

  const gap = Math.max(0, target - totalEstimadoMes)
  const weightedAvg = mix?.weightedAvg || 0

  const byPlan = useMemo(() => {
    return PLAN_ORDER.map((plan) => ({
      plan,
      price: planPrices[plan] || 0,
      needed: calcBusinessesNeeded(gap, planPrices[plan] || 0),
    }))
  }, [gap, planPrices])

  const byMix = calcBusinessesNeeded(gap, weightedAvg)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">Calculadora</p>
      <h2 className="mt-1 text-lg font-bold text-slate-900">Cuántos negocios para llegar a $X</h2>
      <p className="mt-1 text-sm text-slate-600">
        Estimación mensual con precios de config. No incluye proyecciones ni renovaciones.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Stat label="Planes activos" value={formatArs(ingresosPlanesActivos)} />
        <Stat label="Banners del mes" value={formatArs(ingresosBannersMes)} />
        <Stat label="Total estimado" value={formatArs(totalEstimadoMes)} strong />
      </div>

      <div className="mt-5">
        <label htmlFor="revenue-target" className="mb-1.5 block text-sm font-medium text-slate-700">
          Facturación objetivo (ARS / mes)
        </label>
        <input
          id="revenue-target"
          type="text"
          inputMode="numeric"
          value={targetInput}
          onChange={(e) => setTargetInput(e.target.value)}
          placeholder="Ej: 500000"
          className="w-full max-w-xs rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none ring-teal/25 focus:border-teal focus:ring-2"
        />
      </div>

      {target > 0 ? (
        <div className="mt-5 space-y-4">
          {gap <= 0 ? (
            <p className="rounded-xl bg-teal-soft/60 px-4 py-3 text-sm font-medium text-teal-dark">
              Ya superás el objetivo con el total estimado actual.
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-700">
                Faltan <strong>{formatArs(gap)}</strong> para llegar a {formatArs(target)}.
              </p>
              {weightedAvg > 0 ? (
                <p className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Con el mix actual ({Math.round((mix.basico || 0) * 100)}% Básico ·{' '}
                  {Math.round((mix.destacado || 0) * 100)}% Destacado ·{' '}
                  {Math.round((mix.premium || 0) * 100)}% Premium, ~{formatArs(weightedAvg)} c/u):{' '}
                  <strong>{byMix || '—'}</strong> negocio{byMix === 1 ? '' : 's'} más.
                </p>
              ) : null}
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-4 font-semibold">Si fueran todos…</th>
                      <th className="py-2 pr-4 font-semibold">Precio</th>
                      <th className="py-2 font-semibold">Negocios necesarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPlan.map((row) => (
                      <tr key={row.plan} className="border-b border-slate-100">
                        <td className="py-2.5 pr-4 font-medium capitalize text-slate-800">{row.plan}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{formatArs(row.price)}</td>
                        <td className="py-2.5 font-semibold text-slate-900">{row.needed || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}

function Stat({ label, value, strong = false }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-lg ${strong ? 'font-bold text-teal-dark' : 'font-semibold text-slate-900'}`}>
        {value}
      </p>
    </div>
  )
}
