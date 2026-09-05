'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { useToast } from '@/components/admin/Toast'
import { formatDate } from '@/lib/utils'
import { mascotaEstadoLabel, mascotaTipoLabel } from '@/lib/mascotas/utils'

function EstadoBadge({ estado }) {
  const styles = {
    pendiente: 'bg-amber-soft text-amber-950',
    aprobado: 'bg-teal-soft text-teal-dark',
    rechazado: 'bg-red-50 text-red-700',
    inactivo: 'bg-slate-100 text-slate-600',
    resuelto: 'bg-slate-100 text-slate-700',
  }
  return (
    <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${styles[estado] || styles.inactivo}`}>
      {mascotaEstadoLabel(estado)}
    </span>
  )
}

function AvisoRow({ aviso }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState('')

  const moderate = async (action) => {
    setLoading(action)
    try {
      const res = await fetch('/api/mascotas/moderar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: aviso.id,
          action,
          motivo: action === 'rechazar' ? 'Rechazado por moderación' : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.ok) {
        showToast(data.error || 'No se pudo actualizar', 'error')
        return
      }
      showToast(data.message || 'Actualizado')
      router.refresh()
    } catch {
      showToast('Error de red', 'error')
    } finally {
      setLoading('')
    }
  }

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={aviso.foto_url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-lg font-bold text-slate-900">{aviso.titulo}</h2>
          <EstadoBadge estado={aviso.estado} />
          <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {mascotaTipoLabel(aviso.tipo)}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {aviso.zona}
          {aviso.fecha_hecho ? ` · Hecho ${formatDate(aviso.fecha_hecho)}` : ''}
          {' · Publicado '}
          {formatDate(aviso.creado_en)}
        </p>
        {aviso.rechazo_motivo ? (
          <p className="mt-1 text-xs text-red-600">{aviso.rechazo_motivo}</p>
        ) : null}
      </div>
      {aviso.estado === 'pendiente' ? (
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => moderate('aprobar')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
          >
            {loading === 'aprobar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Aprobar
          </button>
          <button
            type="button"
            disabled={Boolean(loading)}
            onClick={() => moderate('rechazar')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-400 hover:text-red-700 disabled:opacity-60"
          >
            {loading === 'rechazar' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Rechazar
          </button>
        </div>
      ) : null}
    </article>
  )
}

export default function MascotasAdminList({ avisos }) {
  return (
    <div className="mt-4 grid gap-3">
      {avisos.map((aviso) => (
        <AvisoRow key={aviso.id} aviso={aviso} />
      ))}
      {!avisos.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="font-semibold text-slate-800">Todavía no hay avisos</p>
          <p className="mt-1 text-sm text-slate-500">Cuando alguien publique desde /mascotas, aparecen acá.</p>
        </div>
      ) : null}
    </div>
  )
}
