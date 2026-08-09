'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Tag,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const items = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/negocios', label: 'Negocios', icon: Building2 },
  { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/admin/promociones', label: 'Promociones', icon: Tag },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
              active ? 'bg-teal text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={logout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </nav>
  )

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Pilar Informa</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Panel de carga</p>
          <p className="mt-1 text-xs text-slate-500">Solo para el equipo</p>
        </div>
        <NavLinks />
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">Admin</p>
          <p className="font-bold text-slate-900">Pilar Informa</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200"
          aria-label="Menú"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-bold">Menú</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavLinks />
        </div>
      )}
    </>
  )
}
