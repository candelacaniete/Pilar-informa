import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
  Navigation,
  Star,
} from 'lucide-react'
import BusinessCard from '../components/BusinessCard'
import { getBusinessBySlug, getRelatedBusinesses } from '../data/businesses'

export default function BusinessProfile() {
  const { slug } = useParams()
  const business = getBusinessBySlug(slug)

  if (!business) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6">
        <h1 className="font-display text-3xl font-semibold">Negocio no encontrado</h1>
        <p className="mt-3 text-muted">Este perfil todavía no está en la guía.</p>
        <Link to="/guia" className="mt-6 inline-flex text-sm font-semibold text-teal">
          Volver a la guía
        </Link>
      </div>
    )
  }

  const related = getRelatedBusinesses(business.slug)
  const wa = business.whatsapp.replace(/\D/g, '')

  return (
    <div>
      <div className="relative h-56 overflow-hidden md:h-80">
        <img src={business.image} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="-mt-16 relative rounded-[1.5rem] border border-line/70 bg-white p-5 shadow-lift md:-mt-20 md:p-8">
          <Link
            to="/guia"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la guía
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                {business.subcategory}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-ink md:text-4xl">
                {business.name}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
                <span className="inline-flex items-center gap-1 font-semibold text-ink">
                  <Star className="h-4 w-4 fill-amber text-amber" />
                  {business.rating}
                  <span className="font-normal text-muted">({business.reviews} opiniones)</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {business.locality}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {business.verified && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-dark">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verificado
                  </span>
                )}
                {business.featured && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber">
                    <Star className="h-3.5 w-3.5 fill-amber" />
                    Destacado
                  </span>
                )}
                {business.openNow ? (
                  <span className="rounded-md bg-paper-deep px-2.5 py-1 text-xs font-semibold text-ink">
                    Abierto ahora
                  </span>
                ) : (
                  <span className="rounded-md bg-paper-deep px-2.5 py-1 text-xs font-semibold text-muted">
                    Cerrado
                  </span>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-col">
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-teal/30 hover:bg-teal-soft"
              >
                <Navigation className="h-4 w-4" />
                Cómo llegar
              </button>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">
            {business.description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBlock icon={MapPin} label="Dirección" value={business.address} />
            <InfoBlock icon={Clock} label="Horarios" value={business.hours} />
            <InfoBlock icon={MessageCircle} label="WhatsApp" value={business.whatsapp} />
            <InfoBlock
              icon={ExternalLink}
              label="Sitio web"
              value={business.website || 'Sin sitio web'}
            />
          </div>
        </div>

        <section className="py-14 md:py-16">
          <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
            También te puede interesar
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <BusinessCard key={item.id} business={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-paper/70 p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed text-ink">{value}</p>
    </div>
  )
}
