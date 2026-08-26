'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { useToast } from './Toast'

export default function FarmaciasScrapeNowButton() {
  const router = useRouter()
  const { showToast } = useToast()
  const [running, setRunning] = useState(false)

  const onClick = async () => {
    if (running) return
    setRunning(true)
    try {
      const res = await fetch('/api/admin/farmacias-turno/scrape', { method: 'POST' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Error HTTP ${res.status}`)
      }
      showToast(`Scrape OK: ${json.count} farmacias de turno`)
      router.refresh()
    } catch (err) {
      console.error(err)
      showToast(err?.message || 'No se pudo ejecutar el scrape', 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={running}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:border-teal hover:text-teal disabled:opacity-60"
    >
      <RefreshCw className={`h-4 w-4 ${running ? 'animate-spin' : ''}`} />
      {running ? 'Scrapeando…' : 'Actualizar desde Colfarma'}
    </button>
  )
}
