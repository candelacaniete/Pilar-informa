'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { formatArs } from '@/lib/metrics/config'
import { useToast } from '@/components/admin/Toast'

function formatMonth(mes) {
  if (!mes) return ''
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${mes}T12:00:00Z`))
}

function parseAmount(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

function formatThousands(raw) {
  const n = parseAmount(raw)
  if (!n) return ''
  return new Intl.NumberFormat('es-AR').format(n)
}

export default function ProyeccionEditor({ rows = [] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      (rows || []).map((r) => [
        r.id,
        { monto: formatThousands(r.monto_ars), notas: r.notas || '' },
      ]),
    ),
  )
  const [savingId, setSavingId] = useState(null)

  if (!rows?.length) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay filas de proyección. Corré la migración 012 en Supabase.
      </p>
    )
  }

  const save = async (row) => {
    const draft = drafts[row.id] || {}
    const monto = parseAmount(draft.monto)
    if (!monto) {
      showToast('Ingresá un monto válido.', 'error')
      return
    }
    if (!isSupabaseConfigured()) {
      showToast('Modo demo: configurá Supabase', 'error')
      return
    }
    setSavingId(row.id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('metricas_proyeccion')
        .update({ monto_ars: monto, notas: draft.notas || null })
        .eq('id', row.id)
      if (error) throw error
      showToast('Proyección actualizada')
      router.refresh()
    } catch (err) {
      showToast(err.message || 'No se pudo guardar', 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pr-3 font-semibold">Mes</th>
            <th className="py-2 pr-3 font-semibold">Monto (ARS)</th>
            <th className="py-2 pr-3 font-semibold">Notas</th>
            <th className="py-2 font-semibold" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const draft = drafts[row.id] || { monto: '', notas: '' }
            return (
              <tr key={row.id} className="border-b border-slate-100 align-top">
                <td className="py-2.5 pr-3 capitalize text-slate-800">{formatMonth(row.mes)}</td>
                <td className="py-2.5 pr-3">
                  <input
                    value={draft.monto}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, monto: formatThousands(e.target.value) },
                      }))
                    }
                    className="w-36 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                    inputMode="numeric"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">{formatArs(row.monto_ars)} actual</p>
                </td>
                <td className="py-2.5 pr-3">
                  <input
                    value={draft.notas}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, notas: e.target.value },
                      }))
                    }
                    className="w-full min-w-[10rem] rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </td>
                <td className="py-2.5">
                  <button
                    type="button"
                    disabled={savingId === row.id}
                    onClick={() => save(row)}
                    className="rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
                  >
                    {savingId === row.id ? '…' : 'Guardar'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
