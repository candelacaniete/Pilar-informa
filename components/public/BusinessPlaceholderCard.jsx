import Link from 'next/link'

export default function BusinessPlaceholderCard({ title, text, href = '/sumar-negocio' }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-teal/35 bg-teal-soft/40 transition hover:border-teal/50 hover:bg-teal-soft/70">
      <div className="aspect-[16/10] bg-gradient-to-br from-teal-soft via-white to-teal/10" />
      <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
        <p className="font-display text-xl font-semibold text-teal-dark">{title}</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">{text}</p>
        <Link
          href={href}
          className="mt-5 inline-flex items-center justify-center rounded-xl border border-teal/40 bg-white px-4 py-2.5 text-sm font-semibold text-teal-dark transition hover:bg-teal hover:text-white"
        >
          Sumar mi negocio
        </Link>
      </div>
    </article>
  )
}
