import Link from 'next/link'
import { notFound } from 'next/navigation'
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
import BusinessCard from '@/components/public/BusinessCard'
import PremiumGallery from '@/components/public/PremiumGallery'
import { getNegocioBySlug, getNegociosActivos } from '@/lib/data'
import { horariosTexto, planLabel, principalFoto, siteUrl } from '@/lib/utils'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const negocio = await getNegocioBySlug(slug)
  if (!negocio) return { title: 'Negocio no encontrado' }

  const image = principalFoto(negocio)
  const description =
    negocio.descripcion_corta ||
    negocio.descripcion_larga ||
    `${negocio.nombre} en ${negocio.localidad || 'Pilar'}`

  return {
    title: negocio.nombre,
    description,
    openGraph: {
      title: negocio.nombre,
      description,
      images: image ? [{ url: image }] : undefined,
      type: 'website',
    },
  }
}

export default async function NegocioPage({ params }) {
  const { slug } = await params
  const negocio = await getNegocioBySlug(slug)
  if (!negocio) notFound()

  const image = principalFoto(negocio)
  const wa = (negocio.whatsapp || '').replace(/\D/g, '')
  const hours = horariosTexto(negocio.horarios)
  const mapsUrl =
    negocio.lat && negocio.lng
      ? `https://www.google.com/maps/dir/?api=1&destination=${negocio.lat},${negocio.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [negocio.direccion, negocio.localidad, 'Pilar'].filter(Boolean).join(', '),
        )}`

  const related = (await getNegociosActivos({ categoriaSlug: negocio.categorias?.slug }))
    .filter((n) => n.id !== negocio.id)
    .slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: negocio.nombre,
    description: negocio.descripcion_corta || negocio.descripcion_larga,
    image: image || undefined,
    url: `${siteUrl()}/negocio/${negocio.slug}`,
    telephone: negocio.telefono || negocio.whatsapp || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: negocio.direccion || undefined,
      addressLocality: negocio.localidad || 'Pilar',
      addressRegion: 'Buenos Aires',
      addressCountry: 'AR',
    },
    geo:
      negocio.lat && negocio.lng
        ? {
            '@type': 'GeoCoordinates',
            latitude: negocio.lat,
            longitude: negocio.lng,
          }
        : undefined,
    aggregateRating:
      negocio.rating > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: negocio.rating,
            reviewCount: negocio.cantidad_opiniones || 1,
          }
        : undefined,
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative h-56 overflow-hidden md:h-80">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-paper-deep" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative -mt-16 rounded-[1.5rem] border border-line/70 bg-white p-5 shadow-lift md:-mt-20 md:p-8">
          <Link
            href="/guia"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-teal"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la guía
          </Link>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                {negocio.subcategoria || negocio.categorias?.nombre}
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-ink md:text-4xl">
                {negocio.nombre}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
                {negocio.rating > 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-ink">
                    <Star className="h-4 w-4 fill-amber text-amber" />
                    {negocio.rating}
                    {negocio.cantidad_opiniones ? (
                      <span className="font-normal text-muted">
                        ({negocio.cantidad_opiniones} opiniones)
                      </span>
                    ) : null}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {negocio.localidad || 'Pilar'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {negocio.verificado ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal-dark">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verificado
                  </span>
                ) : null}
                {negocio.plan && negocio.plan !== 'basico' ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber">
                    <Star className="h-3.5 w-3.5 fill-amber" />
                    {planLabel(negocio.plan)}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-col">
              {wa ? (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3.5 text-sm font-semibold text-ink transition hover:border-teal/30 hover:bg-teal-soft"
              >
                <Navigation className="h-4 w-4" />
                Cómo llegar
              </a>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-base leading-relaxed text-ink-soft md:text-lg">
            {negocio.descripcion_larga || negocio.descripcion_corta}
          </p>

          {negocio.plan === 'premium' ? (
            <PremiumGallery
              images={[...(negocio.negocio_fotos || [])].sort(
                (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
              )}
              alt={negocio.nombre}
            />
          ) : null}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBlock icon={MapPin} label="Dirección" value={negocio.direccion || '—'} />
            <InfoBlock icon={Clock} label="Horarios" value={hours || 'Consultar'} />
            <InfoBlock
              icon={MessageCircle}
              label="WhatsApp"
              value={negocio.whatsapp || 'No informado'}
            />
            <InfoBlock
              icon={ExternalLink}
              label="Sitio web"
              value={negocio.web || 'Sin sitio web'}
            />
          </div>
        </div>

        {related.length > 0 ? (
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
        ) : (
          <div className="h-14" />
        )}
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
