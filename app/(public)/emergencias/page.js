import { EMERGENCIAS, ZOONOSIS } from '@/lib/emergencias/data'
import { PILAR_ATTRIBUTION, PILAR_GOV_HOME } from '@/lib/emergencias/constants'
import EmergencyNumberCard from '@/components/public/EmergencyNumberCard'
import ZoonosisServiceBlock from '@/components/public/ZoonosisServiceBlock'

export const metadata = {
  title: 'Números de emergencia',
  description:
    'Teléfonos de emergencia en Pilar: 911, 107, 100, 144, Defensa Civil, Centro de Monitoreo y contacto municipal. Más Zoonosis.',
}

export default function EmergenciasPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Utilidades</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Números de emergencia
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Teléfonos oficiales del partido y servicios nacionales. En una urgencia, llamá directo.
        </p>
        <p className="mt-3 text-sm text-muted">
          <a
            href={PILAR_GOV_HOME}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal hover:text-teal-dark"
          >
            {PILAR_ATTRIBUTION}
          </a>
        </p>
      </div>

      <section className="mt-10" aria-labelledby="emergencias-heading">
        <h2 id="emergencias-heading" className="sr-only">
          Listado de emergencias
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EMERGENCIAS.map((item) => (
            <EmergencyNumberCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mt-14" aria-labelledby="tramites-heading">
        <h2 id="tramites-heading" className="font-display text-2xl font-semibold text-ink">
          Trámites y servicios
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Información fija de la municipalidad. Para horarios móviles que cambian seguido, usá el
          enlace oficial.
        </p>
        <div className="mt-6">
          <ZoonosisServiceBlock zoonosis={ZOONOSIS} />
        </div>
      </section>
    </div>
  )
}
