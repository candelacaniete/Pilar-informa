const MAX_POSTS = 6

/**
 * Posts de Instagram visibles en ficha pública (solo Premium).
 * @param {{ plan?: string, negocio_instagram_posts?: object[] }} negocio
 */
export function resolvePremiumInstagramPosts(negocio) {
  if (negocio?.plan !== 'premium') return []

  return [...(negocio.negocio_instagram_posts || [])]
    .filter((post) => post?.post_url)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .slice(0, MAX_POSTS)
}
