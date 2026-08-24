import Link from 'next/link'
import { HOUSE_BANNER_COPY } from '@/lib/banners'

/**
 * Un solo slot de banner (pago o house CTA).
 * Pensado para insertarse en distintas secciones del layout, no en grillas.
 */
export default function BannerSlot({
  slot = 1,
  banner = null,
  houseHref = '/#sumar-negocio',
  className = '',
}) {
  const copy = HOUSE_BANNER_COPY[slot] || HOUSE_BANNER_COPY[1]

  if (banner) {
    return (
      <a
        href={banner.link_url}
        target={banner.link_url?.startsWith('http') ? '_blank' : undefined}
        rel={banner.link_url?.startsWith('http') ? 'noreferrer' : undefined}
        className={`group relative block overflow-hidden rounded-2xl border border-line/70 bg-white shadow-soft ${className}`}
      >
        <div className="aspect-[16/5] overflow-hidden sm:aspect-[21/6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.imagen_url}
            alt={banner.titulo || 'Publicidad'}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        </div>
        {banner.titulo ? (
          <span className="absolute bottom-2 left-2 rounded-md bg-ink/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            {banner.titulo}
          </span>
        ) : null}
      </a>
    )
  }

  return (
    <Link
      href={houseHref}
      className={`flex aspect-[16/5] flex-col items-center justify-center rounded-2xl border border-dashed border-teal/35 bg-teal-soft/40 px-4 text-center transition hover:border-teal/50 hover:bg-teal-soft/70 sm:aspect-[21/6] ${className}`}
    >
      <p className="text-sm font-semibold text-teal-dark">{copy.title}</p>
      <p className="mt-1 text-xs text-ink-soft">{copy.text}</p>
    </Link>
  )
}
