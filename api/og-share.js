import { getShareEntity } from '../src/seo/lookup.js'
import { renderShareHtml } from '../src/seo/shareHtml.js'

export const config = { runtime: 'edge' }

/** HTML 200 para crawlers. Título, descripción e imagen salen solo de lookup.js. */
export default function handler(request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const slug = url.searchParams.get('slug')
  const share = getShareEntity(type, slug)

  return new Response(renderShareHtml(share), {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=600',
    },
  })
}
