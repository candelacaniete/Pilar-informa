const POST_PATH_RE = /^\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/

/** @param {string} raw */
export function normalizeInstagramHandle(raw) {
  const value = String(raw || '').trim()
  if (!value) return ''
  const withoutAt = value.replace(/^@/, '')
  const urlMatch = withoutAt.match(/instagram\.com\/([A-Za-z0-9._]+)/i)
  if (urlMatch) return urlMatch[1].replace(/\/$/, '')
  return withoutAt.split(/[/?#]/)[0] || ''
}

/** @param {string} raw */
export function instagramProfileUrl(raw) {
  const handle = normalizeInstagramHandle(raw)
  return handle ? `https://www.instagram.com/${handle}/` : null
}

/**
 * Normaliza URLs de posts/reels de Instagram.
 * @param {string} raw
 * @returns {string|null}
 */
export function normalizeInstagramPostUrl(raw) {
  const value = String(raw || '').trim()
  if (!value) return null

  try {
    const withProtocol = value.startsWith('http') ? value : `https://${value}`
    const url = new URL(withProtocol)
    const host = url.hostname.replace(/^www\./, '')
    if (!['instagram.com', 'instagr.am'].includes(host)) return null

    const pathMatch = url.pathname.match(POST_PATH_RE)
    if (!pathMatch) return null

    const kind = pathMatch[1] === 'reels' ? 'reel' : pathMatch[1]
    return `https://www.instagram.com/${kind}/${pathMatch[2]}/`
  } catch {
    return null
  }
}

/** @param {string} raw */
export function isValidInstagramPostInput(raw) {
  return Boolean(normalizeInstagramPostUrl(raw))
}
