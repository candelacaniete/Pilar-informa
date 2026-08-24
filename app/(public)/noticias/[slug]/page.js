import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock } from 'lucide-react'
import { getNoticiaBySlug, getNoticias } from '@/lib/data'
import { formatDate } from '@/lib/utils'
import { buildPageMetadata, newsArticleJsonLd } from '@/lib/seo/metadata'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const noticia = await getNoticiaBySlug(slug)
  if (!noticia) return { title: 'Noticia no encontrada' }
  return buildPageMetadata({
    title: noticia.titulo,
    description: noticia.bajada || noticia.cuerpo?.slice(0, 160),
    path: `/noticias/${noticia.slug}`,
    image: noticia.imagen,
    type: 'article',
  })
}

export default async function NoticiaDetallePage({ params }) {
  const { slug } = await params
  const noticia = await getNoticiaBySlug(slug)
  if (!noticia) notFound()

  const relacionadas = (await getNoticias({ limit: 4 }))
    .filter((n) => n.id !== noticia.id)
    .slice(0, 3)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd(noticia)) }}
      />

      <Link
        href="/noticias"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a noticias
      </Link>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
        {noticia.categoria}
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
        {noticia.titulo}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">{noticia.bajada}</p>
      <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <Clock className="h-4 w-4" />
        {noticia.autor || 'Redacción Guía Pilar'} · {formatDate(noticia.publicado_en)}
      </p>

      {noticia.imagen ? (
        <div className="mt-8 overflow-hidden rounded-[1.5rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={noticia.imagen} alt={noticia.titulo} className="aspect-[16/10] w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-8 space-y-4 text-base leading-relaxed text-ink-soft md:text-lg">
        {(noticia.cuerpo || '').split('\n').filter(Boolean).map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      {relacionadas.length > 0 ? (
        <section className="mt-14 border-t border-line/70 pt-10">
          <h2 className="font-display text-2xl font-semibold text-ink">Más noticias</h2>
          <ul className="mt-5 space-y-4">
            {relacionadas.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/noticias/${item.slug}`}
                  className="group block rounded-2xl border border-line/70 bg-white p-4 transition hover:border-teal/25 hover:shadow-soft"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                    {item.categoria}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-ink group-hover:text-teal-dark">
                    {item.titulo}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  )
}
