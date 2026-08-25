import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export default function BusinessCTA() {
  return (
    <section
      id="sumar-negocio"
      className="relative overflow-hidden rounded-[1.75rem] bg-ink px-6 py-10 text-paper md:px-10 md:py-14"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-teal/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-amber/15 blur-3xl"
        aria-hidden
      />

      <div className="relative max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-soft">
          Para comercios y profesionales
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
          ¿Tenés un negocio en Pilar?
        </h2>
        <p className="mt-4 text-base leading-relaxed text-paper/70 md:text-lg">
          Llegá a más personas, aparecé en las búsquedas y hacé que tu negocio sea parte de la guía
          local. Completá el formulario y te respondemos por WhatsApp.
        </p>

        <Link
          href="/sumar-negocio"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
        >
          Sumar mi negocio
          <ArrowRight className="h-4 w-4" />
        </Link>

        <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-paper/55">
          {['Perfiles destacados', 'Promociones', 'Visibilidad local'].map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-teal-soft" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
