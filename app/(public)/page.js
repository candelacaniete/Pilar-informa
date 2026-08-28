import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import SearchBar from '@/components/public/SearchBar'
import SectionHeading from '@/components/public/SectionHeading'
import BusinessCard from '@/components/public/BusinessCard'
import BusinessPlaceholderCard from '@/components/public/BusinessPlaceholderCard'
import PromoGrid from '@/components/public/PromoGrid'
import NewsImage from '@/components/public/NewsImage'
import BusinessCTA from '@/components/public/BusinessCTA'
import InstalaPilar from '@/components/public/InstalaPilar'
import {
  getCategorias,
  getNegociosActivos,
  getNoticias,
  getEventos,
  getPromociones,
  getFarmaciasTurno,
  getFarmaciasScrapeStatus,
  getBannersForMonth,
} from '@/lib/data'
import { COLFARMA_ATTRIBUTION } from '@/lib/farmacias/constants'
import { EMERGENCIAS_TEASER } from '@/lib/emergencias/data'
import { formatDate, formatShortDate } from '@/lib/utils'
import { emptyHomeSlots, getBannerSlot } from '@/lib/banners'
import BannerSlot from '@/components/public/BannerSlot'
import { padWithBusinessPlaceholders } from '@/lib/placeholders'
import { showHomeEventosSection } from '@/lib/contentVisibility'
import { BRAND, BRAND_TAGLINE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from '@/lib/seo/site'
import { buildPageMetadata, organizationJsonLd } from '@/lib/seo/metadata'

export const metadata = {
  ...buildPageMetadata({
    title: `${BRAND} — ${BRAND_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    image: DEFAULT_OG_IMAGE,
  }),
  title: {
    absolute: `${BRAND} — ${BRAND_TAGLINE}`,
  },
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1607252111857-f3ac1e40babc?auto=format&fit=crop&w=1800&q=80'

const discoverCards = [
  {
    slug: 'gastronomia',
    title: 'Gastronomía',
    description: 'Restaurantes, cafés y bares',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'salud',
    title: 'Salud',
    description: 'Profesionales, clínicas y centros',
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'servicios',
    title: 'Servicios',
    description: 'Todo lo que necesitás para resolver',
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
  },
  {
    slug: 'compras',
    title: 'Compras',
    description: 'Comercios y emprendimientos locales',
    image:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80',
  },
]

export default async function HomePage() {
  const [categorias, noticias, destacados, eventos, promociones, farmaciasHoy, homeBanners, scrape] =
    await Promise.all([
      getCategorias(),
      getNoticias({ limit: 4 }),
      getNegociosActivos({ destacados: true, limit: 6 }),
      getEventos({ fromToday: true, limit: 3 }),
      getPromociones({ limit: 3 }),
      getFarmaciasTurno(),
      getBannersForMonth({ ubicacion: 'home' }),
      getFarmaciasScrapeStatus(),
    ])

  const homeCats = categorias.slice(0, 7)
  const [featuredNews, ...secondaryNews] = noticias
  const bannerSlots = emptyHomeSlots(homeBanners)
  const destacadosGrid = padWithBusinessPlaceholders(destacados, 6)
  const showEventos = showHomeEventosSection()

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <section className="relative overflow-hidden border-b border-line/60">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${HERO_IMAGE}')` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/72 to-paper"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-paper via-paper/90 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-14 md:px-6 md:pb-16 md:pt-20">
          <div className="fade-up max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-teal-soft md:text-base">
              Guía Pilar
            </p>
            <h1 className="mt-4 font-display text-[2.85rem] font-semibold leading-[1.02] text-white md:text-6xl lg:text-[4.4rem]">
              Todo Pilar.
              <br />
              En un solo lugar.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Noticias, comercios, servicios, eventos y todo lo que pasa cerca tuyo.
            </p>
          </div>

          <div className="fade-up mt-8 max-w-2xl md:mt-10" style={{ animationDelay: '80ms' }}>
            <SearchBar />
            <p className="mt-3 rounded-lg bg-ink/35 px-3 py-2 text-sm text-white/90 backdrop-blur-sm md:inline-block md:bg-ink/40">
              Restaurantes · Peluquerías · Abogados · Gimnasios · Veterinarias
            </p>
          </div>
        </div>
      </section>

      {/* Banner home · slot 1 — debajo del hero */}
      <section className="mx-auto max-w-6xl px-4 pb-2 pt-4 md:px-6">
        <BannerSlot {...getBannerSlot(bannerSlots, 1)} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="fade-up" style={{ animationDelay: '120ms' }}>
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Explorá por categoría
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {homeCats.map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-line/70 bg-white/70 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-teal/30 hover:bg-white hover:shadow-soft"
              >
                <span className="text-2xl transition group-hover:scale-110" aria-hidden>
                  {cat.icono}
                </span>
                <span className="text-xs font-semibold text-ink-soft group-hover:text-ink">
                  {cat.nombre}
                </span>
              </Link>
            ))}
            <Link
              href="/agenda"
              className="group flex flex-col items-center gap-2 rounded-2xl border border-line/70 bg-white/70 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-teal/30 hover:bg-white hover:shadow-soft"
            >
              <span className="text-2xl transition group-hover:scale-110" aria-hidden>
                🎭
              </span>
              <span className="text-xs font-semibold text-ink-soft group-hover:text-ink">
                Eventos
              </span>
            </Link>
          </div>
        </div>
      </section>

      {farmaciasHoy.length ? (
        <section className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
          <div className="rounded-2xl border border-teal/20 bg-teal-soft/60 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Hoy</p>
                <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Farmacias de turno</h2>
                <p className="mt-1 text-xs text-muted">
                  <a
                    href={scrape.officialHomeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal"
                  >
                    {COLFARMA_ATTRIBUTION}
                  </a>
                  {scrape.stale ? ' · Puede estar desactualizado' : ''}
                </p>
              </div>
              <Link href="/farmacias" className="text-sm font-semibold text-teal hover:text-teal-dark">
                Ver la semana →
              </Link>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {farmaciasHoy.slice(0, 3).map((f) => (
                <li key={f.id} className="rounded-xl bg-white/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">{f.localidad}</p>
                  <p className="mt-0.5 font-semibold text-ink">{f.nombre}</p>
                  <p className="text-xs text-muted">{f.horario}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-4 md:px-6">
        <div className="rounded-2xl border border-line/70 bg-white px-5 py-5 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Utilidades</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Números de emergencia</h2>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
                {EMERGENCIAS_TEASER.join(' · ')}
              </p>
            </div>
            <Link href="/emergencias" className="text-sm font-semibold text-teal hover:text-teal-dark">
              Ver todos →
            </Link>
          </div>
        </div>
      </section>

      {/* Banner home · slot 2 — entre farmacias / noticias */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <BannerSlot {...getBannerSlot(bannerSlots, 2)} />
      </section>

      {featuredNews ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20">
          <SectionHeading
            eyebrow="Medio local"
            title="Lo último de Pilar"
            action={
              <Link
                href="/noticias"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
              >
                Ver todas las noticias
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
            <Link
              href={`/noticias/${featuredNews.slug}`}
              className="group relative overflow-hidden rounded-[1.5rem] bg-ink text-white shadow-soft"
            >
              <NewsImage
                src={featuredNews.imagen}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
              <div className="relative flex min-h-[340px] flex-col justify-end p-6 md:min-h-[420px] md:p-8">
                <span className="w-fit rounded-md bg-teal px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                  {featuredNews.categoria}
                </span>
                <h3 className="mt-3 max-w-xl font-display text-2xl font-semibold leading-snug md:text-3xl lg:text-[2.1rem]">
                  {featuredNews.titulo}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
                  {featuredNews.bajada}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <Clock className="h-3.5 w-3.5" />
                  Pilar · {formatDate(featuredNews.publicado_en)}
                </p>
              </div>
            </Link>

            <div className="flex flex-col gap-4">
              {secondaryNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/noticias/${item.slug}`}
                  className="group flex gap-4 rounded-2xl border border-line/70 bg-white p-3 transition hover:border-teal/25 hover:shadow-soft md:p-4"
                >
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-32">
                    <NewsImage
                      src={item.imagen}
                      alt=""
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                      {item.categoria}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink group-hover:text-teal-dark">
                      {item.titulo}
                    </h3>
                    <p className="mt-2 text-xs text-muted">
                      Pilar · {formatDate(item.publicado_en)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-line/60 bg-white/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Descubrimiento"
            title="Descubrí lugares cerca tuyo"
            subtitle="Encontrá dónde comer, comprar, resolver trámites o disfrutar tu tiempo libre."
            action={
              <Link
                href="/guia"
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-dark"
              >
                Explorar guía
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {discoverCards.map((card) => (
              <Link
                key={card.slug}
                href={`/categoria/${card.slug}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-2xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{card.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Banner home · slot 3 — entre descubrimiento y destacados */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <BannerSlot {...getBannerSlot(bannerSlots, 3)} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Guía local"
          title="Negocios destacados"
          subtitle="Perfiles verificados que la gente de Pilar está mirando."
          action={
            <Link
              href="/guia"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver la guía
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {destacadosGrid.map((item) =>
            item.kind === 'business' ? (
              <BusinessCard key={item.business.id} business={item.business} />
            ) : (
              <BusinessPlaceholderCard
                key={item.key}
                title={item.copy.title}
                text={item.copy.text}
              />
            ),
          )}
        </div>
      </section>

      {showEventos ? (
      <section className="bg-paper-deep/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Agenda"
            title="Qué hacer en Pilar"
            action={
              <Link
                href="/agenda"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
              >
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {eventos.map((event) => (
              <Link
                key={event.id}
                href={`/eventos/${event.slug}`}
                className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.imagen}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                    {formatShortDate(event.fecha)} · {event.ubicacion}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink">{event.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{event.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {/* Banner home · slot 4 — entre agenda y promociones */}
      <section className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <BannerSlot {...getBannerSlot(bannerSlots, 4)} />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Beneficios"
          title="Promociones en Pilar"
          action={
            <Link
              href="/promociones"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver promociones
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <PromoGrid promociones={promociones} minSlots={3} linkToListing />
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 pb-16 md:px-6 md:pb-24">
        <InstalaPilar />
        <BusinessCTA />
      </section>
    </div>
  )
}
