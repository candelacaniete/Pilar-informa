import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import Logo from './Logo'

const navItems = [
  { to: '/noticias', label: 'Noticias' },
  { to: '/guia', label: 'Guía' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/promociones', label: 'Promociones' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/guia?q=${encodeURIComponent(value)}` : '/guia')
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-[4.25rem] md:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-soft text-teal-dark'
                    : 'text-ink-soft hover:bg-paper-deep hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink lg:hidden"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            to="/mapa"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink md:inline-flex"
          >
            Mapa
          </Link>

          <Link
            to="/#sumar-negocio"
            className="hidden rounded-lg bg-teal px-3.5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-dark md:inline-flex"
          >
            ¿Tenés un negocio?
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-paper-deep lg:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-line/70 bg-paper px-4 py-3 lg:hidden">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="¿Qué estás buscando en Pilar?"
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm outline-none ring-teal/30 focus:ring-2"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-lg bg-teal px-3 py-2.5 text-sm font-semibold text-white"
            >
              Ir
            </button>
          </form>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 top-16 z-40 bg-paper lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6" aria-label="Móvil">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3.5 text-lg font-medium transition-colors ${
                    isActive ? 'bg-teal-soft text-teal-dark' : 'text-ink hover:bg-paper-deep'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/mapa"
              className={({ isActive }) =>
                `rounded-xl px-4 py-3.5 text-lg font-medium transition-colors ${
                  isActive ? 'bg-teal-soft text-teal-dark' : 'text-ink hover:bg-paper-deep'
                }`
              }
            >
              Mapa
            </NavLink>
            <Link
              to="/#sumar-negocio"
              className="mt-4 rounded-xl bg-teal px-4 py-3.5 text-center text-base font-semibold text-white"
            >
              ¿Tenés un negocio?
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
