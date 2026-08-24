import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import SectionHeading from '../components/SectionHeading'
import BusinessCard from '../components/BusinessCard'
import BusinessCTA from '../components/BusinessCTA'
import Seo from '../components/Seo'
import JsonLd from '../components/JsonLd'
import { homeCategories, discoverCards } from '../data/categories'
import { getFeaturedNews, getSecondaryNews } from '../data/news'
import { getFeaturedBusinesses } from '../data/businesses'
import { events } from '../data/events'
import { promotions } from '../data/promotions'
import { BRAND, BRAND_TAGLINE, DEFAULT_DESCRIPTION } from '../seo/site'
import { organizationJsonLd } from '../seo/schema'

export default function Home() {
  const featured = getFeaturedNews()
  const secondary = getSecondaryNews()
  const featuredBusinesses = getFeaturedBusinesses().slice(0, 3)
  const upcomingEvents = events.slice(0, 3)
  const featuredPromos = promotions.slice(0, 3)

  return (
    <div>
      <Seo title={`${BRAND} — ${BRAND_TAGLINE}`} description={DEFAULT_DESCRIPTION} path="/" />
      <JsonLd data={organizationJsonLd()} />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line/60">
        <div
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center"
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

          <div className="fade-up-delay-1 mt-8 max-w-2xl md:mt-10">
            <SearchBar />
            <p className="mt-3 rounded-lg bg-ink/35 px-3 py-2 text-sm text-white/90 backdrop-blur-sm md:inline-block md:bg-ink/40">
              Restaurantes · Peluquerías · Abogados · Gimnasios · Veterinarias
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <div className="fade-up-delay-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Explorá por categoría
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {homeCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={cat.href || `/categoria/${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-line/70 bg-white/70 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-teal/30 hover:bg-white hover:shadow-soft"
              >
                <span className="text-2xl transition group-hover:scale-110" aria-hidden>
                  {cat.emoji}
                </span>
                <span className="text-xs font-semibold text-ink-soft group-hover:text-ink">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-20">
        <SectionHeading
          eyebrow="Medio local"
          title="Lo último de Pilar"
          action={
            <Link
              to="/noticias"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver todas las noticias
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <Link
            to={`/noticias/${featured.slug}`}
            className="group relative overflow-hidden rounded-[1.5rem] bg-ink text-white shadow-soft"
          >
            <img
              src={featured.image}
              alt={featured.title}
              className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="relative flex min-h-[340px] flex-col justify-end p-6 md:min-h-[420px] md:p-8">
              <span className="w-fit rounded-md bg-teal px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                {featured.category}
              </span>
              <h3 className="mt-3 max-w-xl font-display text-2xl font-semibold leading-snug md:text-3xl lg:text-[2.1rem]">
                {featured.title}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 md:text-base">
                {featured.excerpt}
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/60">
                <Clock className="h-3.5 w-3.5" />
                {featured.location} · {featured.timeAgo}
              </p>
            </div>
          </Link>

          <div className="flex flex-col gap-4">
            {secondary.map((item) => (
              <Link
                key={item.id}
                to={`/noticias/${item.slug}`}
                className="group flex gap-4 rounded-2xl border border-line/70 bg-white p-3 transition hover:border-teal/25 hover:shadow-soft md:p-4"
              >
                <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-32">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold leading-snug text-ink group-hover:text-teal-dark">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-muted">
                    {item.location} · {item.timeAgo}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DISCOVER */}
      <section className="border-y border-line/60 bg-white/50 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Descubrimiento"
            title="Descubrí lugares cerca tuyo"
            subtitle="Encontrá dónde comer, comprar, resolver trámites o disfrutar tu tiempo libre."
            action={
              <Link
                to="/guia"
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
                to={`/categoria/${card.slug}`}
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={card.image}
                    alt={card.title}
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

      {/* FEATURED BUSINESSES */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Guía local"
          title="Negocios destacados"
          subtitle="Perfiles verificados que la gente de Pilar está mirando."
          action={
            <Link
              to="/guia"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver la guía
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      </section>

      {/* EVENTS */}
      <section className="bg-paper-deep/60 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <SectionHeading
            eyebrow="Agenda"
            title="Qué hacer en Pilar"
            action={
              <Link
                to="/eventos"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
              >
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/eventos/${event.slug}`}
                className="group overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
                    {event.dateLabel} · {event.location}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold text-ink">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PROMOS */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20">
        <SectionHeading
          eyebrow="Beneficios"
          title="Promociones en Pilar"
          action={
            <Link
              to="/promociones"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition hover:text-teal-dark"
            >
              Ver promociones
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {featuredPromos.map((promo) => (
            <Link
              key={promo.id}
              to="/promociones"
              className="group relative overflow-hidden rounded-2xl border border-line/70 bg-white transition hover:shadow-lift"
            >
              <div className="aspect-[16/9] overflow-hidden">
                <img
                  src={promo.image}
                  alt={promo.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <span className="inline-flex rounded-md bg-amber-soft px-2 py-1 text-xs font-bold text-amber">
                  {promo.discount}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">{promo.title}</h3>
                <p className="mt-2 text-sm text-muted">{promo.description}</p>
                <p className="mt-3 text-xs font-medium text-ink-soft">{promo.expires}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
        <BusinessCTA />
      </section>
    </div>
  )
}
