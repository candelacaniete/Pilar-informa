import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import Seo from '../components/Seo'
import JsonLd from '../components/JsonLd'
import { getNewsBySlug } from '../data/news'
import { getShareEntity } from '../seo/lookup'
import { newsArticleJsonLd } from '../seo/schema'

export default function NewsArticle() {
  const { slug } = useParams()
  const item = getNewsBySlug(slug)
  const share = getShareEntity('noticias', slug)

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <Seo
          title={share.title}
          description={share.description}
          path={share.path}
          image={share.image}
        />
        <h1 className="font-display text-3xl font-semibold">Nota no encontrada</h1>
        <p className="mt-3 text-muted">Esa noticia no está en el archivo.</p>
        <Link to="/noticias" className="mt-6 inline-flex text-sm font-semibold text-teal">
          Volver a noticias
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
      <Seo
        title={share.title}
        description={share.description}
        path={share.path}
        image={share.image}
        type="article"
      />
      <JsonLd data={newsArticleJsonLd(item)} />

      <Link
        to="/noticias"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Todas las noticias
      </Link>

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">{item.category}</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
        {item.title}
      </h1>
      <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-soft">
        <Clock className="h-4 w-4" />
        {item.location} · {item.timeAgo}
      </p>

      <div className="mt-8 overflow-hidden rounded-[1.5rem]">
        <img src={item.image} alt={item.title} className="h-auto w-full object-cover" />
      </div>

      <p className="mt-8 text-lg leading-relaxed text-ink-soft">{item.excerpt}</p>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-soft">
        {item.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
