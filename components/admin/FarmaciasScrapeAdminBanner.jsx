import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

/**
 * Banner solo admin (v1: sin email).
 * Por defecto solo avisa si falló / está stale / nunca corrió.
 * Con `showOk` también muestra estado saludable (útil en /admin/farmacias).
 */
export default function FarmaciasScrapeAdminBanner({ status, showOk = false }) {
  if (!status || status.usingMock) return null

  if (status.neverRan) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Scrape de farmacias: todavía no corrió</p>
        <p className="mt-1">
          El cron de las 08:15 AR corre solo si ya pasó ese horario después del deploy. Mientras
          tanto, en esta página usá <strong>Actualizar desde Colfarma</strong> (hace falta{' '}
          <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> en Vercel).
        </p>
      </div>
    )
  }

  const needsAlert = status.failed || status.stale

  if (!needsAlert) {
    if (!showOk) return null
    const when = status.lastOkAt
      ? new Date(status.lastOkAt).toLocaleString('es-AR', {
          timeZone: 'America/Argentina/Buenos_Aires',
        })
      : null
    return (
      <div className="rounded-xl border border-teal/20 bg-teal-soft/40 px-4 py-3 text-sm text-teal-dark">
        <p className="font-semibold">Scrape Colfarma OK</p>
        <p className="mt-1">
          Última corrida exitosa{when ? `: ${when}` : ''}
          {status.lastRun?.farmacias_count != null
            ? ` · ${status.lastRun.farmacias_count} farmacias`
            : ''}
          .
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <div>
          <p className="font-semibold">
            {status.failed
              ? 'Falló el scrape de farmacias de turno'
              : 'Scrape de farmacias desactualizado'}
          </p>
          <p className="mt-1">
            {status.lastRun?.error_message
              ? `Error: ${status.lastRun.error_message}`
              : 'La última actualización automática es vieja o falló.'}{' '}
            Se mantiene lo último cargado. Probá <strong>Actualizar desde Colfarma</strong> en{' '}
            <Link href="/admin/farmacias" className="font-semibold underline underline-offset-2">
              Farmacias
            </Link>
            , o revisá el cron /{' '}
            <a
              href={status.officialTurnoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2"
            >
              Colfarma
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
