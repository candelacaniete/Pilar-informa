import Link from 'next/link'
import { HOUSE_BANNER_COPY } from '@/lib/banners'

/**
 * Un solo slot de banner (pago o house CTA).
 * Altura compacta (~50% de la versión anterior) y legible en mobile.
 */
export default function BannerSlot({
  slot = 1,
  banner = null,
  houseHref = '/sumar-negocio',
  className = '',
}) {
  const copy = HOUSE_BANNER_COPY[slot] || HOUSE_BANNER_COPY[1]
  const shell =
    'block w-full overflow-hidden rounded-xl border sm:rounded-2xl ' +
    'h-[4.5rem] sm:h-[5.25rem] md:h-24 ' +
    className

  if (banner) {
    return (
      <a
        href={banner.link_url}
        target={banner.link_url?.startsWith('http') ? '_blank' : undefined}
        rel={banner.link_url?.startsWith('http') ? 'noreferrer' : undefined}
        className={`group relative border-line/70 bg-white shadow-soft ${shell}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.imagen_url}
          alt={banner.titulo || 'Publicidad'}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />
        {banner.titulo ? (
          <span className="absolute bottom-1.5 left-1.5 max-w-[85%] truncate rounded-md bg-ink/70 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:bottom-2 sm:left-2 sm:text-[11px]">
            {banner.titulo}
          </span>
        ) : null}
      </a>
    )
  }

  return (
    <Link
      href={houseHref}
      className={`flex flex-col items-center justify-center border-dashed border-teal/35 bg-teal-soft/40 px-3 text-center transition hover:border-teal/50 hover:bg-teal-soft/70 sm:px-4 ${shell}`}
    >
      <p className="text-[12px] font-semibold leading-snug text-teal-dark sm:text-sm">{copy.title}</p>
      <p className="mt-0.5 max-w-xl text-[10px] leading-snug text-ink-soft sm:mt-1 sm:text-xs">
        {copy.text}
      </p>
    </Link>
  )
}
