'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Search } from 'lucide-react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { estadoLabel, planLabel, principalFoto, sortNegocios } from '@/lib/utils'
import ExpiryBadge from '@/components/admin/ExpiryBadge'
import { useToast } from '@/components/admin/Toast'

function nextPrioridades(current, neighbor, direction) {
  const currentPrioridad = Number(current.prioridad ?? 100)
  const neighborPrioridad = Number(neighbor.prioridad ?? 100)
  if (currentPrioridad !== neighborPrioridad) {
    return { nextCurrent: neighborPrioridad, nextNeighbor: currentPrioridad }
  }
  return {
    nextCurrent: direction === 'up' ? currentPrioridad - 1 : currentPrioridad + 1,
    nextNeighbor: currentPrioridad,
  }
}

function findSwapIndex(list, index, direction) {
  const current = list[index]
  const step = direction === 'up' ? -1 : 1
  for (let i = index + step; i >= 0 && i < list.length; i += step) {
    if (list[i].plan === current.plan) return i
  }
  return -1
}

export default function NegociosList({ negocios = [], categoriaFiltro = 'todas' }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [pending, startTransition] = useTransition()
  const [busyId, setBusyId] = useState(null)
  const [ordered, setOrdered] = useState(() => sortNegocios(negocios))

  useEffect(() => {
    setOrdered(sortNegocios(negocios))
  }, [negocios])

  const move = async (index, direction) => {
    const targetIndex = findSwapIndex(ordered, index, direction)
    if (targetIndex < 0) return

    const current = ordered[index]
    const neighbor = ordered[targetIndex]
    const { nextCurrent, nextNeighbor } = nextPrioridades(current, neighbor, direction)
    setBusyId(current.id)

    const nextList = ordered.map((item) => {
      if (item.id === current.id) return { ...item, prioridad: nextCurrent }
      if (item.id === neighbor.id) return { ...item, prioridad: nextNeighbor }
      return item
    })
    setOrdered(sortNegocios(nextList))

    try {
      if (!isSupabaseConfigured()) {
        showToast(
          direction === 'up'
            ? `“${current.nombre}” subió en el orden`
            : `“${current.nombre}” bajó en el orden`,
        )
        return
      }

      const supabase = createClient()
      const [{ error: errA }, { error: errB }] = await Promise.all([
        supabase.from('negocios').update({ prioridad: nextCurrent }).eq('id', current.id),
        supabase.from('negocios').update({ prioridad: nextNeighbor }).eq('id', neighbor.id),
      ])
      if (errA || errB) throw errA || errB

      showToast(
        direction === 'up'
          ? `“${current.nombre}” subió en el orden`
          : `“${current.nombre}” bajó en el orden`,
      )
      startTransition(() => router.refresh())
    } catch (err) {
      console.error(err)
      setOrdered(sortNegocios(negocios))
      showToast('No se pudo cambiar el orden. Probá de nuevo.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (!ordered.length) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <Search className="mx-auto h-6 w-6 text-slate-400" />
        <p className="mt-3 font-semibold text-slate-800">No hay negocios con ese filtro</p>
        <p className="mt-1 text-sm text-slate-500">Probá sacar filtros o cargá uno nuevo.</p>
      </div>
    )
  }

  return (
    <div className={`mt-4 grid gap-4 ${pending ? 'opacity-70' : ''}`}>
      <p className="rounded-xl border border-teal/20 bg-teal-soft/50 px-3 py-2 text-sm text-teal-dark">
        Usá <strong>Subir</strong> / <strong>Bajar</strong> para decidir quién aparece primero dentro
        del mismo plan
        {categoriaFiltro !== 'todas' ? ' y de esta categoría' : ''}. El primero de cada grupo es el
        lugar más visible.
      </p>

      {ordered.map((n, index) => {
        const foto = principalFoto(n)
        const isBusy = busyId === n.id
        const canUp = findSwapIndex(ordered, index, 'up') >= 0
        const canDown = findSwapIndex(ordered, index, 'down') >= 0
        const isFirstOfPlan = ordered.findIndex((item) => item.plan === n.plan) === index

        return (
          <article
            key={n.id}
            className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3 sm:contents">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                {index + 1}
              </div>
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
                {foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-slate-900">{n.nombre}</h2>
                <ExpiryBadge planVence={n.plan_vence} estado={n.estado} />
                {isFirstOfPlan && (
                  <span className="inline-flex rounded-md bg-teal-soft px-2 py-1 text-xs font-semibold text-teal-dark">
                    1º en {planLabel(n.plan)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-slate-600">
                {n.categorias?.nombre || 'Sin categoría'}
                {n.localidad ? ` · ${n.localidad}` : ''}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Plan {planLabel(n.plan)} · {estadoLabel(n.estado)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isBusy || !canUp}
                  onClick={() => move(index, 'up')}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Subir ${n.nombre}`}
                >
                  <ArrowUp className="h-4 w-4" />
                  Subir
                </button>
                <button
                  type="button"
                  disabled={isBusy || !canDown}
                  onClick={() => move(index, 'down')}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Bajar ${n.nombre}`}
                >
                  <ArrowDown className="h-4 w-4" />
                  Bajar
                </button>
              </div>
              <Link
                href={`/admin/negocios/${n.id}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-teal hover:text-teal"
              >
                Editar
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
