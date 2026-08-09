import { daysUntil } from '@/lib/utils'

export default function ExpiryBadge({ planVence, estado }) {
  const days = daysUntil(planVence)

  if (estado === 'vencido' || (days !== null && days < 0)) {
    return (
      <span className="inline-flex rounded-md bg-danger-soft px-2 py-1 text-xs font-semibold text-danger">
        Vencido
      </span>
    )
  }

  if (days === null) {
    return (
      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
        Sin fecha
      </span>
    )
  }

  if (days === 0) {
    return (
      <span className="inline-flex rounded-md bg-danger-soft px-2 py-1 text-xs font-semibold text-danger">
        Vence hoy
      </span>
    )
  }

  if (days <= 7) {
    return (
      <span className="inline-flex rounded-md bg-danger-soft px-2 py-1 text-xs font-semibold text-danger">
        Vence en {days} {days === 1 ? 'día' : 'días'}
      </span>
    )
  }

  if (days <= 30) {
    return (
      <span className="inline-flex rounded-md bg-amber-soft px-2 py-1 text-xs font-semibold text-amber">
        Vence en {days} días
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-md bg-teal-soft px-2 py-1 text-xs font-semibold text-teal-dark">
      Al día
    </span>
  )
}
