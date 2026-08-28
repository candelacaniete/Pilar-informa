import Link from 'next/link'
import { Tag } from 'lucide-react'

export default function PromoPlaceholderCard({ title, text, href = '/sumar-negocio' }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-teal/35 bg-teal-soft/40 transition hover:border-teal/50 hover:bg-teal-soft/70">
      <div className="relative flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-teal-soft via-white to-teal/10">
        <span className="inline-flex items-center gap-1 rounded-md border border-teal/30 bg-white/80 px-2.5 py-1 text-xs font-bold text-teal-dark">
          <Tag className="h-3.5 w-3.5" />
          Promo
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 text-center">
        <h3 className="font-display text-xl font-semibold text-teal-dark">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{text}</p>
        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center rounded-xl border border-teal/40 bg-white px-4 py-2.5 text-sm font-semibold text-teal-dark transition hover:bg-teal hover:text-white"
        >
          Consultar espacio
        </Link>
      </div>
    </article>
  )
}
