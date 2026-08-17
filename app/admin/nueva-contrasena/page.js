'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function AdminNuevaContrasenaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase no está configurado.')
        return
      }

      const supabase = createClient()
      if (!supabase) {
        setError('No pudimos conectar con Supabase.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError('No pudimos guardar la contraseña. Pedí un enlace nuevo desde Recuperar acceso.')
        return
      }

      router.push('/admin/login?reset=ok')
      router.refresh()
    } catch {
      setError('Ocurrió un problema. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Pilar Informa</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">
          Elegí una contraseña nueva para tu cuenta de administrador.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña nueva</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              placeholder="Mínimo 8 caracteres"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Repetir contraseña</span>
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              placeholder="Repetí la contraseña"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-dark disabled:opacity-60"
          >
            {loading ? 'Guardando…' : 'Guardar y volver al ingreso'}
          </button>

          <Link
            href="/admin/recuperar"
            className="block text-center text-sm text-slate-600 hover:text-teal"
          >
            Pedir un enlace nuevo
          </Link>
        </form>
      </div>
    </div>
  )
}
