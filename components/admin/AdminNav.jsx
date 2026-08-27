'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Building2,
  CalendarDays,
  Cross,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Tag,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const items = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/negocios', label: 'Negocios', icon: Building2 },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/noticias', label: 'Noticias', icon: Newspaper },
  { href: '/admin/eventos', label: 'Eventos', icon: CalendarDays },
  { href: '/admin/promociones', label: 'Promociones', icon: Tag },
  { href: '/admin/farmacias', label: 'Farmacias de turno', icon: Cross },
]

function NavLinks({ pathname, onNavigate, onLogout }) {
  return (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-3.5 text-base font-semibold transition md:py-3 md:text-sm ${
              active ? 'bg-teal text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
            <span>{item.label}</span>
          </Link>
        )
      })}
      <button
        type="button"
        onClick={onLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base font-semibold text-slate-600 hover:bg-slate-100 md:py-3 md:text-sm"
      >
        <LogOut className="h-5 w-5 shrink-0 md:h-4 md:w-4" />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  )
}

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const logout = async () => {
    const supabase = createClient()
    if (supabase) await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      <header className="admin-mobile-bar">
        <div className="admin-mobile-bar-inner">
          <div style={{ minWidth: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">Admin</p>
            <p className="truncate font-bold text-slate-900">Guía Pilar</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      <aside className="admin-sidebar">
        <div className="border-b border-slate-200 px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Guía Pilar</p>
          <p className="mt-1 text-lg font-bold text-slate-900">Panel de carga</p>
          <p className="mt-1 text-xs text-slate-500">Solo para el equipo</p>
        </div>
        <NavLinks pathname={pathname} onNavigate={() => {}} onLogout={logout} />
      </aside>

      {open ? (
        <div className="admin-drawer">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-bold text-slate-900">Menú</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200"
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} onLogout={logout} />
        </div>
      ) : null}
    </>
  )
}
