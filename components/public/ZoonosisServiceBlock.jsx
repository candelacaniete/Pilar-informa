import Link from 'next/link'
import { Clock, ExternalLink, MapPin } from 'lucide-react'

export default function ZoonosisServiceBlock({ zoonosis }) {
  return (
    <article className="rounded-2xl border border-line bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-2xl font-semibold text-ink">{zoonosis.titulo}</h2>
        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {zoonosis.subtitulo}
        </span>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-muted">
        <li className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          <span>
            {zoonosis.sede.direccion} · {zoonosis.sede.localidad}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
          {zoonosis.sede.horario}
        </li>
      </ul>

      <ul className="mt-6 space-y-3 border-t border-line/70 pt-6">
        {zoonosis.servicios.map((s) => (
          <li key={s.nombre}>
            <p className="font-semibold text-ink">{s.nombre}</p>
            <p className="mt-0.5 text-sm text-muted">{s.detalle}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={zoonosis.cronogramaMovil.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-3 text-sm font-semibold text-white hover:bg-teal-dark"
        >
          {zoonosis.cronogramaMovil.label}
          <ExternalLink className="h-4 w-4" />
        </a>
        <p className="text-xs text-muted">{zoonosis.cronogramaMovil.nota}</p>
      </div>

      <p className="mt-4 text-sm text-muted">
        Fuente:{' '}
        <Link
          href={zoonosis.fuenteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-teal hover:text-teal-dark"
        >
          pilar.gov.ar/tramites/zoonosis/
        </Link>
      </p>
    </article>
  )
}
