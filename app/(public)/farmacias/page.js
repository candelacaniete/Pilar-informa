import Link from 'next/link'
import { MapPin, Phone, Clock } from 'lucide-react'
import { getFarmaciasTurno } from '@/lib/data'
import { formatDate, todayInPilar } from '@/lib/utils'

export const metadata = {
  title: 'Farmacias de turno',
  description: 'Farmacias de turno en Pilar, Del Viso, Zelaya, Derqui y alrededores. Cargadas por Pilar Informa.',
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
  const [hoy, semana] = await Promise.all([
    getFarmaciasTurno({ fromDate: today, toDate: today }),
    getFarmaciasTurno({ fromDate, toDate }),
  ])

  const restoSemana = semana.filter((f) => f.fecha !== today)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Salud</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Farmacias de turno
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Guardias del partido de Pilar, cargadas a mano. Preguntale a Pilar por zona o mirá la
          lista de la semana.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-ink">Hoy</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hoy.map((f) => (
            <FarmaciaCard key={f.id} farmacia={f} destacada />
          ))}
          {!hoy.length && (
            <p className="col-span-full rounded-2xl border border-dashed border-line bg-white px-5 py-10 text-sm text-muted">
              Todavía no hay turnos cargados para hoy. Volvé más tarde o preguntale a Pilar.
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
            <p className="col-span-full text-sm text-muted">No hay más turnos cargados esta semana.</p>
          )}
        </div>
      </section>
    </div>
  )
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
      {farmacia.notas ? <p className="mt-3 text-xs text-muted">{farmacia.notas}</p> : null}
    </article>
  )
}
