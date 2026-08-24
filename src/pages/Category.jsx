import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import BusinessCard from '../components/BusinessCard'
import Seo from '../components/Seo'
import JsonLd from '../components/JsonLd'
import { getCategoryBySlug } from '../data/categories'
import { getBusinessesByCategory } from '../data/businesses'
import { getShareEntity } from '../seo/lookup'
import { categoryJsonLd } from '../seo/schema'

export default function Category() {
  const { slug } = useParams()
  const category = getCategoryBySlug(slug)
  const share = getShareEntity('categoria', slug)

  if (!category) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <Seo
          title={share.title}
          description={share.description}
          path={share.path}
          image={share.image}
        />
        <h1 className="font-display text-3xl font-semibold">Categoría no encontrada</h1>
        <p className="mt-3 text-muted">Esa categoría todavía no está en la guía.</p>
        <Link to="/guia" className="mt-6 inline-flex text-sm font-semibold text-teal">
          Volver a la guía
        </Link>
      </div>
    )
  }

  const listings = getBusinessesByCategory(category.name)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
      <Seo
        title={share.title}
        description={share.description}
        path={share.path}
        image={share.image}
      />
      <JsonLd data={categoryJsonLd(category, listings)} />

      <Link
        to="/guia"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" />
        Ver toda la guía
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal">
            {category.emoji} {category.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {category.h1}
          </h1>
          <h2 className="mt-5 font-display text-2xl font-semibold text-ink md:text-3xl">
            {category.h2}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            {category.description}
          </p>
        </div>
        <div className="overflow-hidden rounded-[1.5rem] border border-line/70">
          <img src={category.image} alt={category.h1} className="h-56 w-full object-cover lg:h-full" />
        </div>
      </div>

      <div className="mt-10 flex items-baseline justify-between gap-3">
        <p className="text-sm text-muted">
          {listings.length} {listings.length === 1 ? 'lugar' : 'lugares'} en {category.name}
        </p>
      </div>

      {listings.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
          <p className="font-display text-2xl font-semibold text-ink">Todavía no hay fichas acá</p>
          <p className="mt-2 text-sm text-muted">
            Esta categoría ya tiene URL y ficha para compartir. Los negocios se van a ir sumando.
          </p>
        </div>
      )}
    </div>
  )
}
