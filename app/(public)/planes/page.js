import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { formatArs } from '@/lib/metrics/config'
import { PUBLIC_PLAN_CATALOG } from '@/lib/plans'

export const metadata = buildPageMetadata({
  title: 'Planes y precios',
  description:
    'Planes Destacado y Premium para aparecer en Guía Pilar. Precios mensuales en pesos argentinos y beneficios de cada plan.',
  path: '/planes',
})

export default function PlanesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Para negocios</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Planes y precios
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
        Todos los negocios en la guía pagan una suscripción mensual. Elegí el plan que mejor se adapte
        a tu comercio o profesional en Pilar.
      </p>

      <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-line/70 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-deep/60 text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-4 font-semibold md:px-6" scope="col">
                  Plan
                </th>
                <th className="px-5 py-4 font-semibold md:px-6" scope="col">
                  Precio / mes
                </th>
                <th className="hidden px-5 py-4 font-semibold sm:table-cell md:px-6" scope="col">
                  Incluye
                </th>
              </tr>
            </thead>
            <tbody>
              {PUBLIC_PLAN_CATALOG.map((plan) => (
                <tr key={plan.value} className="border-b border-line/80 last:border-0">
                  <td className="px-5 py-5 align-top md:px-6">
                    <p className="font-display text-lg font-semibold text-ink">{plan.label}</p>
                    <p className="mt-1 text-xs text-muted sm:hidden">{plan.hint}</p>
                  </td>
                  <td className="px-5 py-5 align-top font-semibold text-teal md:px-6">
                    {formatArs(plan.priceArs)}
                    <span className="block text-xs font-normal text-muted">ARS / mes</span>
                  </td>
                  <td className="hidden px-5 py-5 align-top sm:table-cell md:px-6">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-ink-soft">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 border-t border-line/80 bg-paper-deep/40 px-5 py-5 sm:hidden md:px-6">
          {PUBLIC_PLAN_CATALOG.map((plan) => (
            <div key={`mobile-${plan.value}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{plan.label}</p>
              <ul className="mt-2 space-y-1.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-ink-soft">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted">
        Los precios pueden actualizarse; los cambios no afectan períodos ya abonados. El pago se
        coordina por WhatsApp con suscripción en Mercado Pago.
      </p>

      <div className="mt-10 rounded-[1.5rem] border border-teal/25 bg-teal-soft/50 px-6 py-8 md:px-8">
        <h2 className="font-display text-2xl font-semibold text-ink">¿Listo para sumarte?</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Completá el formulario de alta y te respondemos por WhatsApp para coordinar fotos,
          publicación y el plan que elijas.
        </p>
        <Link
          href="/sumar-negocio"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-dark"
        >
          Sumar mi negocio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
