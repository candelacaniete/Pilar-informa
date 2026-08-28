/** Imagen de noticia con fallback visual cuando no hay URL cargada. */
export default function NewsImage({ src, alt = '', className = '' }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} loading="lazy" />
    )
  }

  return (
    <div
      className={`bg-gradient-to-br from-teal-soft via-paper-deep to-teal/10 ${className}`}
      aria-hidden
    />
  )
}
