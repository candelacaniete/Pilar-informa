'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { authRedirectUrl } from '@/lib/supabase/config'
import { resetErrorMessage } from '@/lib/auth-messages'

export default function AdminRecuperarPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase no está configurado todavía. Configurá las variables en Vercel primero.')
        return
      }

      const supabase = createClient()
      if (!supabase) {
        setError('No pudimos conectar con Supabase. Revisá la configuración del sitio.')
        return
      }

      const redirectTo = authRedirectUrl(
        '/admin/nueva-contrasena',
        typeof window !== 'undefined' ? window.location.origin : undefined
      )
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo,
      })

      if (resetError) {
        setError(resetErrorMessage(resetError, redirectTo))
        return
      }

      setSent(true)
    } catch {
      setError('Ocurrió un problema. Probá de nuevo en unos minutos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Pilar Informa</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Recuperar acceso</h1>
        <p className="mt-2 text-sm text-slate-600">
          Te enviamos un enlace para elegir una contraseña nueva. Revisá también la carpeta de spam.
        </p>

        {sent ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-teal/20 bg-teal/5 px-3 py-3 text-sm text-teal-dark">
              Si el email <strong>{email}</strong> está registrado, vas a recibir un enlace en unos
              minutos. El enlace te lleva a esta web (no a localhost).
            </div>
            <Link
              href="/admin/login"
              className="block w-full rounded-xl bg-teal px-4 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-teal-dark"
            >
              Volver al ingreso
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email del administrador</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
                placeholder="tu@email.com"
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
              {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
            </button>

            <Link href="/admin/login" className="block text-center text-sm text-slate-600 hover:text-teal">
              ← Volver al ingreso
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
