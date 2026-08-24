'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { useToast } from './Toast'

export default function CodigoResenaField({ codigo }) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  if (!codigo) return null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(codigo)
      setCopied(true)
      showToast('Código copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      showToast('No se pudo copiar', 'error')
    }
  }

  return (
    <div className="rounded-xl border border-teal/30 bg-teal-soft/30 p-4">
      <p className="text-sm font-medium text-slate-800">Código para reseñas de clientes</p>
      <p className="mt-1 text-xs text-slate-600">
        Compartilo con clientes reales (local, WhatsApp, ticket). Es reutilizable y no se gasta.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-white px-3 py-2 font-mono text-lg font-bold tracking-widest text-teal-dark">
          {codigo}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-teal/40"
        >
          {copied ? <Check className="h-4 w-4 text-teal" /> : <Copy className="h-4 w-4" />}
          Copiar
        </button>
      </div>
    </div>
  )
}
