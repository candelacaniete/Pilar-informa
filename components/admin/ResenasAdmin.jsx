'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { EyeOff, Star, Trash2 } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { formatResenaDate } from '@/lib/resenas'
import { useToast } from './Toast'

export default function ResenasAdmin({ negocioId, resenasIniciales = [] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [items, setItems] = useState(resenasIniciales)
  const [busyId, setBusyId] = useState(null)

  const updateEstado = async (id, estado) => {
    if (!isSupabaseConfigured()) {
      showToast('Modo demo: configurá Supabase', 'error')
      return
    }
    setBusyId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('resenas').update({ estado }).eq('id', id)
      if (error) throw error
      setItems((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)))
      showToast(estado === 'oculta' ? 'Reseña oculta' : 'Reseña republicada')
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast('No se pudo actualizar la reseña', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id) => {
    if (!confirm('¿Eliminar esta reseña? No se puede deshacer.')) return
    if (!isSupabaseConfigured()) {
      showToast('Modo demo: configurá Supabase', 'error')
      return
    }
    setBusyId(id)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('resenas').delete().eq('id', id)
      if (error) throw error
      setItems((prev) => prev.filter((r) => r.id !== id))
      showToast('Reseña eliminada')
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast('No se pudo eliminar', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (!items.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Reseñas</h2>
        <p className="mt-2 text-sm text-slate-500">Todavía no hay reseñas para este negocio.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Reseñas</h2>
      <p className="mt-1 text-sm text-slate-500">Moderá opiniones publicadas por clientes con código.</p>
      <ul className="mt-4 divide-y divide-slate-100">
        {items.map((r) => (
          <li key={r.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-3.5 w-3.5 ${n <= r.calificacion ? 'fill-amber text-amber' : 'text-slate-200'}`}
                    />
                  ))}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                    r.estado === 'publicada'
                      ? 'bg-teal-soft text-teal-dark'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r.estado === 'publicada' ? 'Publicada' : 'Oculta'}
                </span>
                <time className="text-xs text-slate-400">{formatResenaDate(r.creado_en)}</time>
              </div>
              {r.texto ? (
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{r.texto}</p>
              ) : (
                <p className="mt-2 text-sm italic text-slate-400">Sin comentario</p>
              )}
            </div>
            <div className="flex shrink-0 gap-2">
              {r.estado === 'publicada' ? (
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => updateEstado(r.id, 'oculta')}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                  Ocultar
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busyId === r.id}
                  onClick={() => updateEstado(r.id, 'publicada')}
                  className="inline-flex items-center gap-1 rounded-lg border border-teal/30 px-3 py-1.5 text-xs font-semibold text-teal hover:bg-teal-soft"
                >
                  Republicar
                </button>
              )}
              <button
                type="button"
                disabled={busyId === r.id}
                onClick={() => remove(r.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger hover:bg-danger-soft"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
