'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function NegociosFilters({ categorias = [] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const update = (key, value) => {
    const next = new URLSearchParams(params.toString())
    if (!value || value === 'todas' || value === 'todos') next.delete(key)
    else next.set(key, value)
    startTransition(() => {
      router.push(`/admin/negocios?${next.toString()}`)
    })
  }

  return (
    <div className={`mt-6 grid min-w-0 grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-3 ${pending ? 'opacity-70' : ''}`}>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Buscar</span>
        <input
          defaultValue={params.get('q') || ''}
          onChange={(e) => update('q', e.target.value)}
          placeholder="Nombre, barrio…"
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Categoría</span>
        <select
          defaultValue={params.get('categoria') || 'todas'}
          onChange={(e) => update('categoria', e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal"
        >
          <option value="todas">Todas</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium text-slate-700">Estado</span>
        <select
          defaultValue={params.get('estado') || 'todos'}
          onChange={(e) => update('estado', e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-teal"
        >
          <option value="todos">Todos</option>
          <option value="activo">Activo</option>
          <option value="pausado">Pausado</option>
          <option value="vencido">Vencido</option>
        </select>
      </label>
    </div>
  )
}
