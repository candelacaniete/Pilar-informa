/** Galerías demo para fichas Premium (máx. 6) cuando Supabase aún no tiene fotos. */
export const DEMO_GALLERY_BY_SLUG = {
  'casa-marea': [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1200&q=80',
  ],
  katem: [
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  ],
  konstruct: [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80',
  ],
  'vet-pilar': [
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80',
  ],
}

const MAX_FOTOS = 6

/**
 * Une fotos reales de Supabase con el set demo del slug si hace falta
 * para que el carrusel Premium tenga al menos varias imágenes navegables.
 */
export function resolvePremiumGalleryFotos(slug, plan, fotos = []) {
  if (plan !== 'premium') return []

  const fromDb = [...(fotos || [])]
    .filter((f) => f?.url)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .slice(0, MAX_FOTOS)

  if (fromDb.length >= 2) return fromDb

  const demoUrls = DEMO_GALLERY_BY_SLUG[slug] || []
  if (!demoUrls.length) return fromDb

  const seen = new Set(fromDb.map((f) => f.url))
  const merged = [...fromDb]

  demoUrls.forEach((url, i) => {
    if (seen.has(url) || merged.length >= MAX_FOTOS) return
    seen.add(url)
    merged.push({
      id: `demo-${slug}-${i}`,
      url,
      orden: merged.length,
      es_principal: merged.length === 0,
    })
  })

  return merged
}
