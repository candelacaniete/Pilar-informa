'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { useToast } from '@/components/admin/Toast'

export default function MetasEditor({ rows = [] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      (rows || []).map((r) => [
        r.id,
        {
          valor: String(r.valor_objetivo ?? ''),
          desde: r.desde || '',
          hasta: r.hasta || '',
          activo: Boolean(r.activo),
        },
      ]),
    ),
  )
  const [savingId, setSavingId] = useState(null)

  if (!rows?.length) {
    return (
      <p className="text-sm text-slate-500">
        Todavía no hay metas. Corré la migración 013 en Supabase.
      </p>
    )
  }

  const save = async (row) => {
    const draft = drafts[row.id] || {}
    const valor = Number(draft.valor)
    if (!Number.isFinite(valor) || valor <= 0) {
      showToast('El objetivo tiene que ser un número positivo.', 'error')
      return
    }
    if (!draft.desde || !draft.hasta) {
      showToast('Completá desde y hasta.', 'error')
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
        .from('metricas_metas')
        .update({
          valor_objetivo: valor,
          desde: draft.desde,
          hasta: draft.hasta,
          activo: Boolean(draft.activo),
        })
        .eq('id', row.id)
      if (error) throw error
      showToast('Meta actualizada')
      router.refresh()
    } catch (err) {
      showToast(err.message || 'No se pudo guardar', 'error')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const draft = drafts[row.id] || {}
        return (
          <div
            key={row.id}
            className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="text-sm font-semibold capitalize text-slate-900">
                {row.tipo} {row.periodo ? `· ${row.periodo}` : ''}
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                <label className="text-xs text-slate-600">
                  Objetivo
                  <input
                    type="number"
                    min="1"
                    value={draft.valor}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, valor: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Desde
                  <input
                    type="date"
                    value={draft.desde}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, desde: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </label>
                <label className="text-xs text-slate-600">
                  Hasta
                  <input
                    type="date"
                    value={draft.hasta}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [row.id]: { ...draft, hasta: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm"
                  />
                </label>
              </div>
              <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={Boolean(draft.activo)}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [row.id]: { ...draft, activo: e.target.checked },
                    }))
                  }
                />
                Activa
              </label>
            </div>
            <button
              type="button"
              disabled={savingId === row.id}
              onClick={() => save(row)}
              className="h-fit self-end rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
            >
              {savingId === row.id ? '…' : 'Guardar'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
