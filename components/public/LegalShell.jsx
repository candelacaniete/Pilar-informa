import Link from 'next/link'

export function LegalDraftNotice() {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
      Borrador para revisión legal antes de publicar. No reemplaza el asesoramiento de un abogado.
    </p>
  )
}

export function LegalNav({ current }) {
  const items = [
    { href: '/privacidad', label: 'Privacidad' },
    { href: '/terminos', label: 'Términos' },
    { href: '/cookies', label: 'Cookies' },
  ]

  return (
    <nav aria-label="Documentos legales" className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.href === current
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-teal text-white'
                : 'bg-white text-ink-soft ring-1 ring-line hover:text-teal'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function LegalShell({
  current,
  eyebrow,
  title,
  children,
  updatedLabel = 'Pendiente de publicación oficial',
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6 md:py-14">
      <LegalNav current={current} />
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-teal">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        {title}
      </h1>
      <div className="mt-5">
        <LegalDraftNotice />
      </div>
      <div className="legal-prose mt-10 space-y-8 text-base leading-relaxed text-ink-soft">
        {children}
      </div>
      <p className="mt-12 border-t border-line/80 pt-6 text-sm text-muted">
        Última actualización: {updatedLabel}
      </p>
      <p className="mt-8">
        <Link href="/" className="text-sm font-medium text-teal hover:underline">
          ← Volver al inicio
        </Link>
      </p>
    </div>
  )
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={typeof item === 'string' ? item : item.key}>{item}</li>
      ))}
    </ul>
  )
}
