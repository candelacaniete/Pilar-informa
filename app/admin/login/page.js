'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!isSupabaseConfigured()) {
        // Modo demo: entra al panel con datos locales
        router.push('/admin')
        return
      }

      const supabase = createClient()
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password })
      if (signError) {
        setError('No pudimos iniciar sesión. Revisá el email y la contraseña.')
        return
      }

      // Verificar rol admin
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: adminRow } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!adminRow) {
        await supabase.auth.signOut()
        setError('Este usuario no tiene permiso de administrador.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('Ocurrió un problema al ingresar. Probá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Pilar Informa</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Ingresar al panel</h1>
        <p className="mt-2 text-sm text-slate-600">
          Acá cargás negocios, noticias, eventos y promociones.
        </p>

        {!isSupabaseConfigured() && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-900">
            Modo demo: todavía no hay Supabase configurado. Podés entrar sin usuario para ver el
            panel con datos de ejemplo.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required={isSupabaseConfigured()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              placeholder="tu@email.com"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Contraseña</span>
            <input
              type="password"
              required={isSupabaseConfigured()}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              placeholder="••••••••"
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
            {loading ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
