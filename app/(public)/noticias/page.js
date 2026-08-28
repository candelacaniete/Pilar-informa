import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { getNoticias } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { buildPageMetadata } from '@/lib/seo/metadata'
import NewsImage from '@/components/public/NewsImage'

export const metadata = buildPageMetadata({
  title: 'Noticias de Pilar',
  description: 'Lo último de Pilar: obras, tránsito, gastronomía, cultura y agenda local del partido.',
  path: '/noticias',
})

export default async function NoticiasPage() {
  const items = await getNoticias()
  const [featured, ...rest] = items

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al inicio
      </Link>

      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">Noticias</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Lo último de Pilar
        </h1>
        <p className="mt-3 text-base text-muted md:text-lg">
          Descubrí lo que pasa cerca tuyo. Ciudad, cultura, gastronomía y agenda local.
        </p>
      </div>

      {featured ? (
        <Link
          href={`/noticias/${featured.slug}`}
          className="mt-10 block overflow-hidden rounded-[1.5rem] border border-line/70 bg-white shadow-soft transition hover:shadow-lift md:mt-12"
        >
          <article className="grid md:grid-cols-2">
            <div className="aspect-[16/11] md:aspect-auto md:min-h-[360px]">
              <NewsImage src={featured.imagen} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-10">
              <span className="w-fit rounded-md bg-teal-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-teal-dark">
                {featured.categoria}
              </span>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-ink md:text-3xl">
                {featured.titulo}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted">{featured.bajada}</p>
              <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-soft">
                <Clock className="h-4 w-4" />
                Pilar · {formatDate(featured.publicado_en)}
              </p>
            </div>
          </article>
        </Link>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((item) => (
          <Link
            key={item.id}
            href={`/noticias/${item.slug}`}
            className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <article>
              <div className="aspect-[16/10] overflow-hidden">
                <NewsImage
                  src={item.imagen}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                  {item.categoria}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-ink">
                  {item.titulo}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{item.bajada}</p>
                <p className="mt-4 text-xs text-ink-soft">Pilar · {formatDate(item.publicado_en)}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-line px-6 py-14 text-center">
          <p className="font-display text-2xl font-semibold">No hay noticias publicadas</p>
        </div>
      ) : null}
    </div>
  )
}
