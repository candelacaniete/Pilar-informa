import { useEffect } from 'react'
import { BRAND, DEFAULT_DESCRIPTION, DEFAULT_IMAGE, absoluteUrl, pageTitle } from '../seo/site'

function upsertMeta(selector, attribute, key, content) {
  if (!content) return
  let el = document.head.querySelector(`${selector}[${attribute}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attribute, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  robots,
}) {
  const fullTitle = pageTitle(title)
  const url = absoluteUrl(path)

  useEffect(() => {
    const previous = document.title
    document.title = fullTitle
    upsertMeta('meta', 'name', 'description', description)
    upsertLink('canonical', url)
    upsertMeta('meta', 'property', 'og:locale', 'es_AR')
    upsertMeta('meta', 'property', 'og:site_name', BRAND)
    upsertMeta('meta', 'property', 'og:type', type)
    upsertMeta('meta', 'property', 'og:title', fullTitle)
    upsertMeta('meta', 'property', 'og:description', description)
    upsertMeta('meta', 'property', 'og:image', image)
    upsertMeta('meta', 'property', 'og:url', url)
    upsertMeta('meta', 'name', 'twitter:card', 'summary_large_image')
    upsertMeta('meta', 'name', 'twitter:title', fullTitle)
    upsertMeta('meta', 'name', 'twitter:description', description)
    upsertMeta('meta', 'name', 'twitter:image', image)
    if (robots) upsertMeta('meta', 'name', 'robots', robots)
    return () => {
      document.title = previous
    }
  }, [fullTitle, description, url, image, type, robots])

  return null
}
