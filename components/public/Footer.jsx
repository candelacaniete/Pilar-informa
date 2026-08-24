import Link from 'next/link'
import { Mail, Share2 } from 'lucide-react'
import Logo from './Logo'

const links = [
  { href: '/noticias', label: 'Noticias' },
  { href: '/guia', label: 'Guía' },
  { href: '/agenda', label: 'Eventos' },
  { href: '/promociones', label: 'Promociones' },
  { href: '/farmacias', label: 'Farmacias de turno' },
  { href: '/#instalar-pilar', label: 'Instalar Pilar' },
  { href: '/#sumar-negocio', label: 'Sumar mi negocio' },
]

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line/80 bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr] md:px-6 md:py-16">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper/70">
            Todo Pilar. En un solo lugar.
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-paper/55">
            Noticias, lugares, servicios y eventos de Pilar.
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/45">Explorar</h3>
          <ul className="mt-4 space-y-2.5">
            {links.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm text-paper/80 transition-colors hover:text-teal-soft">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/45">Contacto</h3>
          <a
            href="mailto:hola@pilarinforma.ar"
            className="mt-4 inline-flex items-center gap-2 text-sm text-paper/80 transition-colors hover:text-teal-soft"
          >
            <Mail className="h-4 w-4" />
            hola@pilarinforma.ar
          </a>
          <div className="mt-5 flex gap-3">
            <a
              href="#instagram"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-paper/70 transition hover:border-teal/40 hover:text-teal-soft"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="#redes"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-paper/70 transition hover:border-teal/40 hover:text-teal-soft"
              aria-label="Redes"
            >
              <Share2 className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-paper/45 md:flex-row md:items-center md:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Guía Pilar</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/privacidad" className="hover:text-teal-soft">
              Privacidad
            </Link>
            <Link href="/terminos" className="hover:text-teal-soft">
              Términos
            </Link>
            <Link href="/cookies" className="hover:text-teal-soft">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
