import { normalizeInstagramPostUrl } from '@/lib/instagram/utils'

const GRAPH_VERSION = 'v21.0'
const CAPTION_MAX = 220

function getAccessToken() {
  if (process.env.META_OEMBED_ACCESS_TOKEN) {
    return process.env.META_OEMBED_ACCESS_TOKEN
  }
  const appId = process.env.FACEBOOK_APP_ID || process.env.META_APP_ID
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.META_APP_SECRET
  if (appId && appSecret) return `${appId}|${appSecret}`
  return null
}

/**
 * @param {string} rawUrl
 * @returns {Promise<{ ok: true, data: object } | { ok: false, error: string, postUrl?: string|null }>}
 */
export async function fetchInstagramOEmbed(rawUrl) {
  const postUrl = normalizeInstagramPostUrl(rawUrl)
  if (!postUrl) {
    return { ok: false, error: 'URL de Instagram inválida', postUrl: null }
  }

  const accessToken = getAccessToken()
  if (!accessToken) {
    return {
      ok: false,
      error:
        'Falta META_OEMBED_ACCESS_TOKEN (o FACEBOOK_APP_ID + FACEBOOK_APP_SECRET) para obtener vistas previas.',
      postUrl,
    }
  }

  const endpoint = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/instagram_oembed`)
  endpoint.searchParams.set('url', postUrl)
  endpoint.searchParams.set('access_token', accessToken)
  endpoint.searchParams.set('omitscript', 'true')
  endpoint.searchParams.set('hidecaption', 'false')

  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(12_000),
    })
    const body = await response.json().catch(() => ({}))

    if (!response.ok) {
      const message =
        body?.error?.message ||
        body?.error_user_msg ||
        `Meta oEmbed respondió ${response.status}`
      return { ok: false, error: message, postUrl }
    }

    const caption = String(body.title || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, CAPTION_MAX)

    return {
      ok: true,
      data: {
        post_url: postUrl,
        thumbnail_url: body.thumbnail_url || null,
        caption: caption || null,
        author_name: body.author_name || null,
        synced_at: new Date().toISOString(),
      },
    }
  } catch (err) {
    return {
      ok: false,
      error: err?.message || 'No se pudo contactar a Meta oEmbed',
      postUrl,
    }
  }
}

/**
 * @param {string[]} urls
 */
export async function fetchInstagramOEmbedBatch(urls = []) {
  const unique = [...new Set(urls.map((u) => String(u || '').trim()).filter(Boolean))]
  const results = []

  for (const url of unique) {
    // eslint-disable-next-line no-await-in-loop
    const result = await fetchInstagramOEmbed(url)
    results.push({ input: url, ...result })
  }

  return results
}
