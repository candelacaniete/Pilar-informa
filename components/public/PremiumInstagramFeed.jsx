import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { instagramProfileUrl, normalizeInstagramHandle } from '@/lib/instagram/utils'

/**
 * Grid de publicaciones de Instagram cacheadas (Premium).
 */
export default function PremiumInstagramFeed({ posts = [], instagramHandle = '' }) {
  const visible = (posts || []).filter((post) => post?.post_url)
  const handle = normalizeInstagramHandle(instagramHandle)
  const profileUrl = instagramProfileUrl(instagramHandle)

  if (!visible.length) return null

  return (
    <section className="mt-10" aria-label="Últimas publicaciones en Instagram">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
            Últimas en Instagram
          </h2>
          {handle ? (
            <p className="mt-1 text-sm text-muted">@{handle}</p>
          ) : null}
        </div>
        {profileUrl ? (
          <Link
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal/30 hover:bg-teal-soft hover:text-teal-dark"
          >
            <Instagram className="h-4 w-4" />
            Ver perfil
          </Link>
        ) : null}
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {visible.map((post) => (
          <li key={post.id || post.post_url}>
            <a
              href={post.post_url}
              target="_blank"
              rel="noreferrer"
              className="group block overflow-hidden rounded-xl border border-line/70 bg-paper-deep shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative aspect-square overflow-hidden bg-paper">
                {post.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.thumbnail_url}
                    alt={post.caption || 'Publicación de Instagram'}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <Instagram className="h-8 w-8" />
                  </div>
                )}
                <span className="absolute inset-0 bg-ink/0 transition group-hover:bg-ink/10" />
              </div>
              {post.caption ? (
                <p className="line-clamp-2 px-2.5 py-2 text-xs leading-snug text-ink-soft">
                  {post.caption}
                </p>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
