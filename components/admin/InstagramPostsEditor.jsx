'use client'

import { useState } from 'react'
import { Instagram, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from './Toast'

const MAX_POSTS = 6

function emptyPosts() {
  return Array.from({ length: MAX_POSTS }, () => ({
    post_url: '',
    thumbnail_url: '',
    caption: '',
  }))
}

function normalizeFromInitial(posts = []) {
  const base = emptyPosts()
  posts
    .slice()
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .slice(0, MAX_POSTS)
    .forEach((post, index) => {
      base[index] = {
        post_url: post.post_url || '',
        thumbnail_url: post.thumbnail_url || '',
        caption: post.caption || '',
      }
    })
  return base
}

export default function InstagramPostsEditor({ value, onChange, disabled = false }) {
  const { showToast } = useToast()
  const [syncing, setSyncing] = useState(false)

  const posts = value?.length ? value : emptyPosts()

  const setPost = (index, patch) => {
    const next = posts.map((post, i) => (i === index ? { ...post, ...patch } : post))
    onChange(next)
  }

  const filledUrls = posts.map((p) => p.post_url.trim()).filter(Boolean)

  const syncPreviews = async () => {
    if (!filledUrls.length) {
      showToast('Pegá al menos una URL de publicación de Instagram.', 'error')
      return
    }

    setSyncing(true)
    try {
      const response = await fetch('/api/admin/instagram/oembed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: filledUrls }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron obtener las vistas previas')
      }

      const next = [...posts]
      const filledIndexes = posts
        .map((post, index) => (post.post_url.trim() ? index : -1))
        .filter((index) => index >= 0)

      filledIndexes.forEach((postIndex, resultIndex) => {
        const result = data.results?.[resultIndex]
        if (!result?.ok || !result.data?.post_url) return
        next[postIndex] = {
          post_url: result.data.post_url,
          thumbnail_url: result.data.thumbnail_url || '',
          caption: result.data.caption || '',
        }
      })

      onChange(next)

      if (data.synced > 0) {
        showToast(
          data.failed
            ? `${data.synced} vista(s) actualizada(s). ${data.failed} URL(s) con error.`
            : `${data.synced} vista(s) actualizada(s).`,
          data.failed ? 'error' : 'success',
        )
      } else {
        const firstError = data.results?.find((r) => !r.ok)?.error
        showToast(firstError || 'No se pudo obtener ninguna vista previa.', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Error al sincronizar Instagram', 'error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Pegá hasta {MAX_POSTS} links de publicaciones o reels. Luego actualizá las vistas previas.
        </p>
        <button
          type="button"
          disabled={disabled || syncing || !filledUrls.length}
          onClick={syncPreviews}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal/40 hover:text-teal disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Actualizar vistas previas
        </button>
      </div>

      <div className="grid gap-3">
        {posts.map((post, index) => (
          <div
            key={`ig-post-${index}`}
            className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:grid-cols-[88px_1fr]"
          >
            <div className="relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-white">
              {post.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.thumbnail_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Instagram className="h-7 w-7" />
                </div>
              )}
            </div>
            <label className="block min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Publicación {index + 1}
              </span>
              <input
                value={post.post_url}
                disabled={disabled}
                onChange={(e) =>
                  setPost(index, {
                    post_url: e.target.value,
                    thumbnail_url: '',
                    caption: '',
                  })
                }
                placeholder="https://www.instagram.com/p/…"
                className="mt-1.5 box-border w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
              />
              {post.caption ? (
                <span className="mt-1.5 block text-xs leading-relaxed text-slate-500 line-clamp-2">
                  {post.caption}
                </span>
              ) : null}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

export { emptyPosts, normalizeFromInitial, MAX_POSTS as INSTAGRAM_MAX_POSTS }
