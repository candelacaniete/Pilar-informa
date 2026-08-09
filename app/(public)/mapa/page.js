import MapExplorer from '@/components/public/MapExplorer'
import { getNegociosActivos } from '@/lib/data'

export const metadata = {
  title: 'Mapa',
  description: 'Explorá comercios y servicios de Pilar en el mapa.',
}

export default async function MapaPage() {
  const negocios = await getNegociosActivos()
  const serializable = negocios.map((n) => ({
    id: n.id,
    nombre: n.nombre,
    slug: n.slug,
    subcategoria: n.subcategoria,
    localidad: n.localidad,
    rating: n.rating,
    lat: n.lat,
    lng: n.lng,
    categorias: n.categorias
      ? { id: n.categorias.id, nombre: n.categorias.nombre, slug: n.categorias.slug }
      : null,
    negocio_fotos: (n.negocio_fotos || []).map((f) => ({
      id: f.id,
      url: f.url,
      es_principal: f.es_principal,
    })),
  }))

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <MapExplorer businesses={serializable} />
    </div>
  )
}
