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
  Instagram,
} from 'lucide-react'
import BusinessCard from '@/components/public/BusinessCard'
import PremiumGallery from '@/components/public/PremiumGallery'
import PremiumInstagramFeed from '@/components/public/PremiumInstagramFeed'
import ResenasSection from '@/components/public/ResenasSection'
import { getNegocioBySlug, getNegociosActivos, getResenasPublicas } from '@/lib/data'
import { resolvePremiumGalleryFotos } from '@/lib/gallery'
import { resolvePremiumInstagramPosts } from '@/lib/instagram/resolve'
import { instagramProfileUrl } from '@/lib/instagram/utils'
import { horariosTexto, planLabel, principalFoto } from '@/lib/utils'
import { buildPageMetadata, localBusinessJsonLd } from '@/lib/seo/metadata'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const negocio = await getNegocioBySlug(slug)
  if (!negocio) return { title: 'Negocio no encontrado' }

  const image = principalFoto(negocio)
  const description =
    negocio.descripcion_corta ||
    negocio.descripcion_larga ||
    `${negocio.nombre} en ${negocio.localidad || 'Pilar'}`

  return buildPageMetadata({
    title: `${negocio.nombre} en ${negocio.localidad || 'Pilar'}`,
    description,
    path: `/negocio/${negocio.slug}`,
    image,
    type: 'website',
  })
}

export default async function NegocioPage({ params }) {
  const { slug } = await params
  const negocio = await getNegocioBySlug(slug)
  if (!negocio) notFound()

  const fotos = resolvePremiumGalleryFotos(
    negocio.slug,
    negocio.plan,
    negocio.negocio_fotos,
  )
  const isPremium = negocio.plan === 'premium'
  const showGallery = isPremium && fotos.length > 0
  const instagramPosts = resolvePremiumInstagramPosts(negocio)
  const instagramUrl = instagramProfileUrl(negocio.instagram)
  const image = principalFoto(negocio) || fotos[0]?.url || null
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

  const resenas = await getResenasPublicas(negocio.id)

  const jsonLd = localBusinessJsonLd(negocio, image)

  return (
    <div className="bg-paper pb-4 pt-8 md:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {!showGallery ? (
        <div className="relative mx-auto mb-0 h-40 max-w-6xl overflow-hidden px-4 sm:h-52 md:h-64 md:px-6">
          <div className="h-full overflow-hidden rounded-[1.5rem]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={`${negocio.nombre} en ${negocio.localidad || 'Pilar'}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-paper-deep" />
            )}
            <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div
          className={`relative rounded-[1.5rem] border border-line/70 bg-white p-5 shadow-lift md:p-8 ${
            showGallery ? '' : '-mt-12 md:-mt-16'
          }`}
        >
          {showGallery ? (
            <PremiumGallery images={fotos} alt={negocio.nombre} />
          ) : null}

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
                {negocio.plan ? (
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

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-line/70 bg-paper/70 p-5">
              <h2 className="font-display text-xl font-semibold text-ink">Dónde queda</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                {negocio.direccion || 'Dirección a confirmar'}
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal"
              >
                <MapPin className="h-4 w-4" />
                Cómo llegar
              </a>
            </section>

            <section className="rounded-2xl border border-line/70 bg-paper/70 p-5">
              <h2 className="font-display text-xl font-semibold text-ink">Horarios</h2>
              <p className="mt-3 inline-flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                {hours || 'Consultar'}
              </p>
            </section>

            <section className="rounded-2xl border border-line/70 bg-paper/70 p-5">
              <h2 className="font-display text-xl font-semibold text-ink">Cómo contactarlos</h2>
              {wa ? (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-teal"
                >
                  <MessageCircle className="h-4 w-4" />
                  {negocio.whatsapp}
                </a>
              ) : (
                <p className="mt-3 text-sm text-muted">WhatsApp no informado</p>
              )}
              {negocio.web ? (
                <a
                  href={negocio.web.startsWith('http') ? negocio.web : `https://${negocio.web}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-teal"
                >
                  <ExternalLink className="h-4 w-4" />
                  {negocio.web}
                </a>
              ) : (
                <p className="mt-2 text-sm text-muted">Sin sitio web</p>
              )}
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-teal"
                >
                  <Instagram className="h-4 w-4" />
                  {negocio.instagram?.startsWith('http') ? 'Instagram' : `@${negocio.instagram.replace(/^@/, '')}`}
                </a>
              ) : null}
            </section>
          </div>

          <PremiumInstagramFeed posts={instagramPosts} instagramHandle={negocio.instagram} />

          <ResenasSection negocio={negocio} resenasIniciales={resenas} />
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
