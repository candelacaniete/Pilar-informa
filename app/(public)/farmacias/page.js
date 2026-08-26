import Link from 'next/link'
import { ExternalLink, MapPin, Phone, Clock } from 'lucide-react'
import {
  getFarmaciasDirectorio,
  getFarmaciasScrapeStatus,
  getFarmaciasTurno,
} from '@/lib/data'
import { COLFARMA_ATTRIBUTION } from '@/lib/farmacias/constants'
import { formatDate, todayInPilar } from '@/lib/utils'

export const metadata = {
  title: 'Farmacias de turno',
  description:
    'Farmacias de turno en Pilar, Del Viso, Zelaya, Derqui y alrededores. Datos del Colegio de Farmacéuticos de Pilar.',
}

function weekRange() {
  const fromDate = todayInPilar()
  const to = new Date(`${fromDate}T12:00:00`)
  to.setDate(to.getDate() + 6)
  return {
    fromDate,
    toDate: to.toISOString().slice(0, 10),
  }
}

export default async function FarmaciasPage() {
  const today = todayInPilar()
  const { fromDate, toDate } = weekRange()
  const [hoy, semana, scrape, directorio] = await Promise.all([
    getFarmaciasTurno({ fromDate: today, toDate: today }),
    getFarmaciasTurno({ fromDate, toDate }),
    getFarmaciasScrapeStatus(),
    getFarmaciasDirectorio(),
  ])

  const restoSemana = semana.filter((f) => f.fecha !== today)
  const porLocalidad = groupByLocalidad(directorio)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Salud</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Farmacias de turno
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Guardias del partido de Pilar. Actualizamos la lista cada mañana con la información
          oficial del Colegio de Farmacéuticos.
        </p>
        <p className="mt-3 text-sm text-muted">
          <a
            href={scrape.officialHomeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-teal hover:text-teal-dark"
          >
            {COLFARMA_ATTRIBUTION}
          </a>
        </p>
      </div>

      {scrape.stale ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 md:px-5">
          <p className="font-semibold">La información puede estar desactualizada</p>
          <p className="mt-1">
            No pudimos refrescar el listado oficial o la última actualización es vieja. Mostramos
            lo último que tenemos.{' '}
            <a
              href={scrape.officialTurnoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              Consultá el sitio del Colegio
            </a>
            .
          </p>
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-ink">Hoy</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hoy.map((f) => (
            <FarmaciaCard key={f.id} farmacia={f} destacada />
          ))}
          {!hoy.length && (
            <p className="col-span-full rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-sm text-muted">
              Todavía no hay turnos para hoy.{' '}
              <a
                href={scrape.officialTurnoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-teal hover:text-teal-dark"
              >
                Ver en Colfarma
              </a>{' '}
              o preguntale a Pilar más tarde.
            </p>
          )}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold text-ink">Esta semana</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {restoSemana.map((f) => (
            <FarmaciaCard key={f.id} farmacia={f} />
          ))}
          {!restoSemana.length && (
            <p className="col-span-full text-sm text-muted">
              El Colegio publica el turno del día; cuando haya más fechas cargadas, van a aparecer
              acá.
            </p>
          )}
        </div>
      </section>

      <section className="mt-14">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-ink">Directorio de farmacias</h2>
          <p className="mt-2 text-sm text-muted">
            Listado de farmacias del partido (no solo las de turno). Fuente:{' '}
            <a
              href={scrape.officialHomeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-teal hover:text-teal-dark"
            >
              colfarma.info/pilar
            </a>
            .
          </p>
        </div>

        <div className="mt-6 space-y-8">
          {Object.entries(porLocalidad).map(([localidad, items]) => (
            <div key={localidad}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-teal">
                {localidad}
              </h3>
              <ul className="mt-3 divide-y divide-line/70 border-t border-line/70">
                {items.map((f) => (
                  <li key={f.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{f.nombre}</p>
                      {f.direccion ? <p className="text-sm text-muted">{f.direccion}</p> : null}
                    </div>
                    {f.telefono ? (
                      <Link
                        href={`tel:${f.telefono.replace(/\s/g, '')}`}
                        className="text-sm font-medium text-teal hover:text-teal-dark"
                      >
                        {f.telefono}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!directorio.length && (
            <p className="text-sm text-muted">
              El directorio se carga con la migración 016. Si ya la corriste y sigue vacío,
              avisale al equipo.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function groupByLocalidad(list) {
  const map = new Map()
  for (const item of list) {
    const key = item.localidad || 'Otras'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return Object.fromEntries(map)
}

function FarmaciaCard({ farmacia, destacada = false }) {
  return (
    <article
      className={`rounded-2xl border bg-white p-5 ${
        destacada ? 'border-teal/30 shadow-soft' : 'border-line/70'
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
        {farmacia.localidad}
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold text-ink">{farmacia.nombre}</h3>
      <p className="mt-2 text-sm font-medium text-ink-soft">{formatDate(farmacia.fecha)}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-muted">
        <li className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          {farmacia.horario}
        </li>
        {farmacia.direccion ? (
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            {farmacia.direccion}
          </li>
        ) : null}
        {farmacia.telefono ? (
          <li className="flex items-start gap-2">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            <Link href={`tel:${farmacia.telefono.replace(/\s/g, '')}`} className="hover:text-teal">
              {farmacia.telefono}
            </Link>
          </li>
        ) : null}
      </ul>
      {farmacia.maps_url ? (
        <a
          href={farmacia.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:text-teal-dark"
        >
          Ver en Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : null}
      {farmacia.notas ? <p className="mt-3 text-xs text-muted">{farmacia.notas}</p> : null}
    </article>
  )
}
